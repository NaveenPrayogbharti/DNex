import { supabase } from '../../../lib/supabase';

export interface CRMDocument {
  id: string;
  case_id: string;
  name: string;
  file_name: string;
  url: string | null;
  version: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

export async function fetchDocuments(caseId: string): Promise<CRMDocument[]> {
  const { data, error } = await supabase
    .from('crm_documents')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CRMDocument[];
}

export async function uploadDocument(
  caseId: string,
  file: File,
  docName: string,
  uploadedByName: string,
  uploadedBy?: string
): Promise<CRMDocument> {
  // Get existing version count for this document name + case
  const { data: existing } = await supabase
    .from('crm_documents')
    .select('version')
    .eq('case_id', caseId)
    .eq('name', docName)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1;

  // Upload to Supabase Storage
  const fileName = `${caseId}/${docName}_v${nextVersion}_${Date.now()}_${file.name}`;
  let url: string | null = null;

  const { error: uploadError } = await supabase.storage
    .from('crm-documents')
    .upload(fileName, file, { upsert: false });

  if (!uploadError) {
    const { data: urlData } = supabase.storage
      .from('crm-documents')
      .getPublicUrl(fileName);
    url = urlData?.publicUrl ?? null;
  } else {
    console.warn('Supabase storage upload failed, falling back to base64 data URL', uploadError);
    // Fallback to base64 data URL if bucket is not configured
    url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Save record
  const { data, error } = await supabase
    .from('crm_documents')
    .insert({
      case_id: caseId,
      name: docName,
      file_name: file.name,
      url,
      version: nextVersion,
      status: 'pending',
      uploaded_by: uploadedBy,
      uploaded_by_name: uploadedByName,
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from('crm_activities').insert({
    case_id: caseId,
    type: 'document',
    description: `Document "${docName}" v${nextVersion} uploaded`,
    performed_by: uploadedBy,
    performed_by_name: uploadedByName,
    metadata: { doc_name: docName, version: nextVersion },
  });

  return data as CRMDocument;
}

export async function updateDocumentStatus(
  id: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<void> {
  const { error } = await supabase
    .from('crm_documents')
    .update({ status, rejection_reason: rejectionReason ?? null })
    .eq('id', id);

  if (error) throw error;
}

export async function addDocumentRecord(
  caseId: string,
  name: string,
  uploadedByName: string,
  uploadedBy?: string
): Promise<CRMDocument> {
  const { data: existing } = await supabase
    .from('crm_documents')
    .select('version')
    .eq('case_id', caseId)
    .eq('name', name)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1;

  const { data, error } = await supabase
    .from('crm_documents')
    .insert({
      case_id: caseId,
      name,
      file_name: name,
      version: nextVersion,
      status: 'pending',
      uploaded_by: uploadedBy,
      uploaded_by_name: uploadedByName,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CRMDocument;
}
