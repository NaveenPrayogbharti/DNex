import { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Upload,
  FileText,
  X,
  Search,
  Filter,
  Users,
  DollarSign,
  Send,
  AlertCircle
} from 'lucide-react';
import { fetchActiveJobs, submitJobApplication, JobPosting } from '../admin/services/careerService';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

export function Careers() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Job for Modal
  const [activeJob, setActiveJob] = useState<JobPosting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneralApplication, setIsGeneralApplication] = useState(false);

  // Application Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationVisa, setLocationVisa] = useState('');
  const [experience, setExperience] = useState('');
  const [coverNote, setCoverNote] = useState('');

  // Resume File State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchActiveJobs();
        setJobs(data);
      } catch (err) {
        console.error('Failed to load careers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Departments for filters
  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => {
      if (j.department) set.add(j.department);
    });
    return ['All', ...Array.from(set)];
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesDept = selectedDepartment === 'All' || job.department === selectedDepartment;
      const s = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(s) ||
        job.description.toLowerCase().includes(s) ||
        job.department.toLowerCase().includes(s) ||
        job.location.toLowerCase().includes(s);
      return matchesDept && matchesSearch;
    });
  }, [jobs, selectedDepartment, searchQuery]);

  // Handle Opening Job Application Modal
  const openApplyModal = (job?: JobPosting) => {
    if (job) {
      setActiveJob(job);
      setIsGeneralApplication(false);
    } else {
      setActiveJob(null);
      setIsGeneralApplication(true);
    }
    setSubmitSuccess(false);
    setSubmitError('');
    setIsModalOpen(true);
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    // Validate type
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setFileError('Please upload a PDF or Microsoft Word document (.pdf, .doc, .docx).');
      return;
    }

    setResumeFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setResumeBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    setResumeBase64('');
    setFileError('');
  };

  // Handle Application Submit
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const targetTitle = isGeneralApplication ? 'General Application / Future Opportunities' : (activeJob?.title || 'Job Opening');

    try {
      const res = await submitJobApplication({
        job_id: isGeneralApplication ? null : (activeJob?.id || null),
        job_title: targetTitle,
        full_name: fullName,
        email,
        phone,
        current_location: locationVisa,
        experience_years: experience,
        cover_letter: coverNote,
        resume_filename: resumeFile?.name || '',
        resume_base64: resumeBase64,
      });

      if (res.success) {
        setSubmitSuccess(true);
        // Reset inputs
        setFullName('');
        setEmail('');
        setPhone('');
        setLocationVisa('');
        setExperience('');
        setCoverNote('');
        setResumeFile(null);
        setResumeBase64('');
      } else {
        setSubmitError(res.error || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #102748 100%)`,
        padding: '80px 20px 90px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative backdrop glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,150,60,0.15) 0%, rgba(201,150,60,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(201,150,60,0.15)',
            border: '1px solid rgba(201,150,60,0.3)',
            borderRadius: '30px',
            padding: '6px 18px',
            color: GOLD,
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <Sparkles size={14} /> Join the DNEX Team • Dubai & Sharjah
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '20px',
            maxWidth: '900px',
            margin: '0 auto 20px'
          }}>
            Build Your Career at the Forefront of UAE Business Transformation
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: '#cbd5e1',
            maxWidth: '750px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            We are looking for passionate consultants, tax specialists, legal experts, and client executives to deliver world-class corporate advisory services to international businesses.
          </p>

          {/* Quick Jump / CTA */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a
              href="#openings"
              style={{
                backgroundColor: GOLD,
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(201,150,60,0.35)',
                transition: 'transform 0.2s',
              }}
            >
              Explore Open Positions ({jobs.length}) <ArrowRight size={16} />
            </a>

            <button
              onClick={() => openApplyModal()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Drop Your CV in Talent Pool
            </button>
          </div>
        </div>
      </section>

      {/* ── CURRENT OPENINGS SECTION ──────────────────────────────────────── */}
      <section id="openings" style={{ maxWidth: '1200px', margin: '60px auto 80px', padding: '0 20px' }}>
        
        {/* Section Title & Search */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Opportunities
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: NAVY, margin: '6px 0 0' }}>
              Current Job Openings
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
              Explore career vacancies across our business setup, tax, and legal advisory departments.
            </p>
          </div>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 14px',
            width: '100%',
            maxWidth: '320px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}>
            <Search size={18} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by role or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: NAVY
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '32px'
        }}>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                border: selectedDepartment === dept ? `1px solid ${GOLD}` : '1px solid #e2e8f0',
                backgroundColor: selectedDepartment === dept ? GOLD : '#ffffff',
                color: selectedDepartment === dept ? '#ffffff' : '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedDepartment === dept ? '0 2px 8px rgba(201,150,60,0.25)' : 'none'
              }}
            >
              {dept} {dept === 'All' ? `(${jobs.length})` : ''}
            </button>
          ))}
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{
              width: '36px', height: '36px', border: `3px solid ${GOLD}`, borderTopColor: 'transparent',
              borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite'
            }} />
            <p>Loading current openings...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '50px 20px',
            textAlign: 'center'
          }}>
            <Briefcase size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>
              No openings currently match your criteria
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '450px', margin: '0 auto 20px' }}>
              We regularly update our positions. You can also submit an open application to our talent database.
            </p>
            <button
              onClick={() => openApplyModal()}
              style={{
                backgroundColor: GOLD,
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Submit Open Application
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {filteredJobs.map(job => (
              <div
                key={job.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
                    <span style={{
                      backgroundColor: 'rgba(201,150,60,0.12)',
                      color: GOLD,
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {job.department}
                    </span>

                    <span style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      {job.employment_type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '19px',
                    fontWeight: 700,
                    color: NAVY,
                    margin: '0 0 10px',
                    lineHeight: 1.3
                  }}>
                    {job.title}
                  </h3>

                  {/* Meta info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} style={{ color: GOLD }} />
                      {job.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} style={{ color: GOLD }} />
                      {job.experience_level}
                    </div>
                  </div>

                  {/* Description preview */}
                  <p style={{
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: 1.6,
                    margin: '0 0 20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>
                </div>

                {/* Footer action */}
                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    {job.salary_range ? job.salary_range : 'Competitive package'}
                  </div>

                  <button
                    onClick={() => openApplyModal(job)}
                    style={{
                      backgroundColor: NAVY,
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    View & Apply <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

      {/* ── TALENT POOL / GENERAL APPLICATION BANNER ─────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
          border: '1px solid #cbd5e1',
          borderRadius: '16px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(201,150,60,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: GOLD,
            marginBottom: '16px'
          }}>
            <Sparkles size={26} />
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>
            Don't see your specific role listed?
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '600px', margin: '0 0 24px', lineHeight: 1.6 }}>
            We are always happy to hear from exceptional talent in UAE company formation, corporate legal compliance, auditing, and business development. Submit your CV directly to our talent acquisition team.
          </p>
          <button
            onClick={() => openApplyModal()}
            style={{
              backgroundColor: GOLD,
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(201,150,60,0.25)'
            }}
          >
            Submit General Application <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* APPLICATION & JOB DETAIL MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 22, 40, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            {/* Success State */}
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: NAVY, margin: '0 0 10px' }}>
                  Application Submitted Successfully!
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Thank you for applying to <strong>DNEX Consulting</strong>! We have received your application and resume. Our recruitment team is reviewing your profile and will contact you directly if your qualifications match our current vacancies.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    backgroundColor: GOLD,
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Return to Careers
                </button>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '18px' }}>
                  <span style={{
                    backgroundColor: 'rgba(201,150,60,0.12)',
                    color: GOLD,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {isGeneralApplication ? 'Open Talent Application' : (activeJob?.department || 'Opening')}
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: NAVY, margin: '8px 0 6px' }}>
                    {isGeneralApplication ? 'Join Our Talent Network' : activeJob?.title}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} style={{ color: GOLD }} />
                      {isGeneralApplication ? 'Dubai & Sharjah, UAE' : activeJob?.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} style={{ color: GOLD }} />
                      {isGeneralApplication ? 'Various Opportunities' : activeJob?.employment_type}
                    </div>
                  </div>
                </div>

                {/* If specific job, show job description and responsibilities */}
                {!isGeneralApplication && activeJob && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '28px',
                    fontSize: '13px'
                  }}>
                    <p style={{ margin: '0 0 16px', color: '#334155', lineHeight: 1.6 }}>
                      {activeJob.description}
                    </p>

                    {activeJob.responsibilities && activeJob.responsibilities.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 700, color: NAVY, marginBottom: '6px' }}>Key Responsibilities:</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.5 }}>
                          {activeJob.responsibilities.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeJob.requirements && activeJob.requirements.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 700, color: NAVY, marginBottom: '6px' }}>Requirements & Qualifications:</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.5 }}>
                          {activeJob.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeJob.benefits && activeJob.benefits.length > 0 && (
                      <div>
                        <div style={{ fontWeight: 700, color: NAVY, marginBottom: '6px' }}>What We Offer:</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.5 }}>
                          {activeJob.benefits.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Application Form */}
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: NAVY, marginBottom: '16px' }}>
                  Candidate Information & Resume
                </h3>

                {submitError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    <AlertCircle size={16} />
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmitApplication}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="John Doe"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                        Current Location & Visa Status
                      </label>
                      <input
                        type="text"
                        value={locationVisa}
                        onChange={e => setLocationVisa(e.target.value)}
                        placeholder="e.g. Dubai (Employment Visa / Visit Visa / Overseas)"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        value={experience}
                        onChange={e => setExperience(e.target.value)}
                        placeholder="e.g. 4 Years"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Resume Upload Box */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                      Resume / CV Document (PDF or Word)
                    </label>

                    {resumeFile ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '12px 16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={20} style={{ color: GOLD }} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: NAVY }}>{resumeFile.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '24px 16px',
                        cursor: 'pointer',
                        backgroundColor: '#f8fafc',
                        transition: 'border-color 0.2s',
                      }}>
                        <Upload size={24} style={{ color: GOLD, marginBottom: '6px' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: NAVY }}>
                          Click to upload your resume / CV
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          PDF, DOC, DOCX up to 10MB
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}

                    {fileError && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>
                        {fileError}
                      </div>
                    )}
                  </div>

                  {/* Candidate Note / Query */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                      Candidate Note / Cover Letter (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      placeholder="Briefly introduce yourself, your expertise in the UAE, or notice period..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: '10px 28px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: GOLD,
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(201,150,60,0.3)'
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                      <Send size={15} />
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
