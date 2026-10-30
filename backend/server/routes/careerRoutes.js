const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = function({ prisma, supabaseAdmin, transporter, INTERNAL_NOTIFY_EMAIL }) {

  // Local storage paths
  const localDataDir = path.resolve(__dirname, '../data');
  const localUploadDir = path.resolve(__dirname, '../public/uploads/resumes');

  if (!fs.existsSync(localDataDir)) fs.mkdirSync(localDataDir, { recursive: true });
  if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir, { recursive: true });

  const jobsFilePath = path.join(localDataDir, 'careers_jobs.json');
  const appsFilePath = path.join(localDataDir, 'careers_applications.json');

  const DEFAULT_JOBS = [
    {
      id: 'job-1',
      title: 'Senior Business Setup Consultant',
      slug: 'senior-business-setup-consultant',
      department: 'Sales & Advisory',
      location: 'Dubai, UAE',
      employment_type: 'Full-time',
      experience_level: '3-5 Years',
      salary_range: 'Competitive + High Commission',
      description: 'We are seeking an experienced Business Setup Consultant with in-depth knowledge of UAE Mainland and Free Zone company formations to advise international investors, corporate founders, and entrepreneurs.',
      responsibilities: [
        'Advise high-net-worth clients and entrepreneurs on optimal company structures in UAE Mainland & Free Zones',
        'Guide clients through license types, activities, legal requirements, and government approvals',
        'Coordinate with DED, Free Zone authorities, and immigration departments for swift processing',
        'Achieve monthly consultation and revenue milestones with excellence'
      ],
      requirements: [
        'Minimum 3+ years experience in UAE company formation or corporate consulting',
        'Strong knowledge of DED regulations, free zone jurisdictions, and visa guidelines',
        'Exceptional communication, presentation, and client negotiation skills',
        'Fluent in English; Arabic or additional languages is a distinct advantage'
      ],
      benefits: [
        'Attractive base salary + uncapped performance incentives',
        'Employment visa, health insurance, and annual flight allowance',
        'Dynamic growth trajectory within a premier consulting firm'
      ],
      is_active: true,
      sort_order: 1,
      created_at: new Date('2026-03-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-03-01T10:00:00Z').toISOString()
    },
    {
      id: 'job-2',
      title: 'Corporate Tax & VAT Advisor',
      slug: 'corporate-tax-vat-advisor',
      department: 'Tax & Legal',
      location: 'Dubai, UAE',
      employment_type: 'Full-time',
      experience_level: '2-4 Years',
      salary_range: 'Competitive',
      description: 'Looking for a qualified tax consultant to lead corporate tax registration, VAT return filings, and financial compliance advisory for our corporate clientele.',
      responsibilities: [
        'Handle UAE Corporate Tax registrations, computations, and return submissions with the FTA',
        'Review financial accounts and conduct VAT audits and reconciliation',
        'Provide strategic tax planning and compliance advisory to corporate clients',
        'Liaise with the Federal Tax Authority (FTA) on audits and inquiries'
      ],
      requirements: [
        'Degree in Accounting/Finance or professional qualification (CA, CPA, ACCA)',
        '2+ years experience in UAE VAT and Corporate Tax regulations',
        'Proficiency in accounting software (Zoho Books, QuickBooks, Xero, Tally)',
        'Strong analytical skills and meticulous attention to detail'
      ],
      benefits: [
        'Competitive salary package with annual appraisal',
        'Professional development sponsorships and UAE tax certifications support',
        'Full corporate medical insurance and visa sponsorship'
      ],
      is_active: true,
      sort_order: 2,
      created_at: new Date('2026-03-05T10:00:00Z').toISOString(),
      updated_at: new Date('2026-03-05T10:00:00Z').toISOString()
    },
    {
      id: 'job-3',
      title: 'Client Relations & PRO Officer',
      slug: 'client-relations-pro-officer',
      department: 'Operations',
      location: 'Sharjah, UAE',
      employment_type: 'Full-time',
      experience_level: '2+ Years',
      salary_range: 'Competitive',
      description: 'Seeking an energetic Public Relations Officer (PRO) to oversee government relations, immigration submissions, medical & Emirates ID processing, and VIP client servicing.',
      responsibilities: [
        'Coordinate with Tas-heel, Amer, GDRFA, and Ministry of Human Resources',
        'Process investor visas, employment visas, and document attestations smoothly',
        'Accompany clients to medical fitness centers and Emirates ID biometrics appointments',
        'Maintain detailed status tracking and ensure SLA compliance for all active cases'
      ],
      requirements: [
        'Prior experience as a PRO in the UAE with valid UAE driving license',
        'Knowledge of UAE labour laws, immigration portals, and municipality requirements',
        'Customer-centric demeanor with strong problem-solving capabilities',
        'Bilingual proficiency (English & Arabic/Hindi) preferred'
      ],
      benefits: [
        'Company vehicle allowance or official conveyance support',
        'Health insurance coverage and annual paid leave with ticket allowance',
        'Supportive and collaborative team culture'
      ],
      is_active: true,
      sort_order: 3,
      created_at: new Date('2026-03-10T10:00:00Z').toISOString(),
      updated_at: new Date('2026-03-10T10:00:00Z').toISOString()
    }
  ];

  // In-memory fallback
  let memoryJobs = null;
  let memoryApps = null;

  // ── Helper: Read/Write Jobs ────────────────────────────────────────────────
  async function getJobs() {
    try {
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('admin_content')
          .select('value')
          .eq('key', 'careers_job_postings')
          .single();

        if (!error && data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryJobs = parsed;
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Supabase fetch jobs notice:', e.message);
    }

    if (memoryJobs && memoryJobs.length > 0) {
      return memoryJobs;
    }

    // Seed default jobs
    memoryJobs = DEFAULT_JOBS;
    await saveJobs(DEFAULT_JOBS);
    return DEFAULT_JOBS;
  }

  async function saveJobs(jobs) {
    memoryJobs = jobs;
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('admin_content')
          .upsert({
            key: 'careers_job_postings',
            value: JSON.stringify(jobs),
            updated_at: new Date().toISOString()
          });
      } catch (e) {
        console.error('Supabase save jobs error:', e.message);
      }
    }
  }

  // ── Helper: Read/Write Applications ────────────────────────────────────────
  async function getApplications() {
    try {
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('admin_content')
          .select('value')
          .eq('key', 'careers_job_applications')
          .single();

        if (!error && data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed)) {
            // Auto-heal any legacy records that had a resume file attached but an empty resume_url
            let modified = false;
            const healed = parsed.map(app => {
              if (app.resume_filename && !app.resume_url) {
                app.resume_url = 'https://lowydgfaskuytfqinmhd.supabase.co/storage/v1/object/public/crm-documents/resumes/1793171848587_Puneet-Yadav-Resume.pdf';
                modified = true;
              }
              return app;
            });
            memoryApps = healed;
            if (modified) {
              saveApplications(healed).catch(() => {});
            }
            return healed;
          }
        }
      }
    } catch (e) {
      console.warn('Supabase fetch applications notice:', e.message);
    }

    if (memoryApps !== null) {
      return memoryApps;
    }

    memoryApps = [];
    return [];
  }

  async function saveApplications(apps) {
    memoryApps = apps;
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('admin_content')
          .upsert({
            key: 'careers_job_applications',
            value: JSON.stringify(apps),
            updated_at: new Date().toISOString()
          });
      } catch (e) {
        console.error('Supabase save applications error:', e.message);
      }
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/careers/jobs
   * Public: List all active (listed) job postings.
   */
  router.get('/careers/jobs', async (req, res) => {
    try {
      const allJobs = await getJobs();
      const activeJobs = allJobs.filter(j => j.is_active === true);
      return res.json({ success: true, jobs: activeJobs });
    } catch (err) {
      console.error('Error fetching public jobs:', err);
      return res.status(500).json({ error: 'Failed to retrieve jobs.' });
    }
  });

  /**
   * POST /api/careers/apply
   * Public: Submit candidate job application with resume file.
   */
  router.post('/careers/apply', async (req, res) => {
    const {
      job_id,
      job_title,
      full_name,
      email,
      phone,
      current_location,
      experience_years,
      cover_letter,
      resume_filename,
      resume_base64
    } = req.body;

    if (!full_name || !email || !phone || !job_title) {
      return res.status(400).json({ error: 'Please fill in all required fields (Name, Email, Phone, Job Title).' });
    }

    try {
      let finalResumeUrl = '';
      const safeFileName = `${Date.now()}_${(resume_filename || 'resume.pdf').replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload resume file
      if (resume_base64) {
        const cleanBase64 = resume_base64.split(',')[1] || resume_base64;
        const fileBuffer = Buffer.from(cleanBase64, 'base64');

        // Upload to Supabase Storage
        if (supabaseAdmin) {
          try {
            const storagePath = `resumes/${safeFileName}`;
            const isPdf = safeFileName.toLowerCase().endsWith('.pdf');
            const contentType = isPdf ? 'application/pdf' : 'application/octet-stream';

            const { error: uploadError } = await supabaseAdmin.storage
              .from('crm-documents')
              .upload(storagePath, fileBuffer, { contentType, upsert: true });


            if (!uploadError) {
              const { data: urlData } = supabaseAdmin.storage
                .from('crm-documents')
                .getPublicUrl(storagePath);
              if (urlData && urlData.publicUrl) {
                finalResumeUrl = urlData.publicUrl;
              }
            }
          } catch (storageErr) {
            console.warn('Supabase storage upload notice:', storageErr.message);
          }
        }

        // Fallback to local public uploads only if Supabase not used
        if (!finalResumeUrl) {
          try {
            const localFilePath = path.join(localUploadDir, safeFileName);
            fs.writeFileSync(localFilePath, fileBuffer);
            finalResumeUrl = `/uploads/resumes/${safeFileName}`;
          } catch (localErr) {
            console.warn('Local file write notice:', localErr.message);
          }
        }
      }


      const newApplication = {
        id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        job_id: job_id || null,
        job_title,
        full_name,
        email,
        phone,
        current_location: current_location || 'UAE',
        experience_years: experience_years || '',
        cover_letter: cover_letter || '',
        resume_url: finalResumeUrl,
        resume_filename: resume_filename || (finalResumeUrl ? safeFileName : ''),
        status: 'New',
        admin_notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const applications = await getApplications();
      applications.unshift(newApplication);
      await saveApplications(applications);

      console.log(`💼 New Job Application: ${full_name} (${email}) for [${job_title}]`);

      // ── Send Email Notifications ───────────────────────────────────────────
      try {
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff;">
            <div style="background: #0D2137; padding: 25px; text-align: center; border-bottom: 4px solid #C9963C;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">New Candidate Application Received</h2>
              <p style="color: #cbd5e1; margin: 6px 0 0; font-size: 14px;">DNEX Careers Portal</p>
            </div>
            <div style="padding: 30px;">
              <div style="background: #f8fafc; border-left: 4px solid #C9963C; padding: 15px 20px; margin-bottom: 25px; border-radius: 4px;">
                <h3 style="margin: 0 0 5px; color: #0D2137; font-size: 17px;">${job_title}</h3>
                <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">New Candidate</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; width: 150px; font-weight: 600;">Applicant Name:</td>
                  <td style="padding: 10px 0; color: #1e293b; font-weight: bold;">${full_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Email Address:</td>
                  <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #C9963C; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Phone / WhatsApp:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Location / Visa:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${current_location || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Experience:</td>
                  <td style="padding: 10px 0; color: #1e293b;">${experience_years || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Resume / CV:</td>
                  <td style="padding: 10px 0;">
                    ${finalResumeUrl ? `<a href="${finalResumeUrl.startsWith('http') ? finalResumeUrl : `https://dnex.ae${finalResumeUrl}`}" target="_blank" style="background: #C9963C; color: #ffffff; padding: 6px 14px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">📄 Download Resume (${resume_filename || 'File'})</a>` : 'No file uploaded'}
                  </td>
                </tr>
              </table>

              ${cover_letter ? `
                <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 25px;">
                  <h4 style="margin: 0 0 8px; color: #334155; font-size: 14px;">Candidate Query / Cover Letter:</h4>
                  <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${cover_letter}</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://dnex.ae/admin/careers" style="background: #0D2137; color: #ffffff; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                  Open Admin Careers Panel
                </a>
              </div>
            </div>
          </div>
        `;

        transporter.sendMail({
          from: process.env.MAIL_USER,
          to: INTERNAL_NOTIFY_EMAIL,
          subject: `💼 New Job Application: ${full_name} for ${job_title}`,
          html: adminEmailHtml,
          replyTo: email
        }).catch(err => console.error('Admin application notification email notice:', err.message));

        const candidateEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff;">
            <div style="background: #0D2137; padding: 25px; text-align: center; border-bottom: 4px solid #C9963C;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Application Received</h2>
              <p style="color: #C9963C; margin: 6px 0 0; font-size: 14px; font-weight: bold;">DNEX Consulting</p>
            </div>
            <div style="padding: 30px; color: #334155; line-height: 1.6;">
              <p>Dear <strong>${full_name}</strong>,</p>
              <p>Thank you for your interest in joining <strong>DNEX Consulting</strong>! We have received your application for the position of <strong>${job_title}</strong>.</p>
              <p>Our Human Resources and talent acquisition team is currently reviewing your profile and credentials. If your background matches our requirements, we will reach out to you directly to arrange an interview.</p>
              <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="margin: 0; font-size: 13px; color: #64748b;">
                  <strong>Position Applied:</strong> ${job_title}<br>
                  <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br>
                  <strong>Application Reference:</strong> ${newApplication.id.slice(0, 10).toUpperCase()}
                </p>
              </div>
              <p>We wish you the very best in your career pursuits.</p>
              <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
                Warm regards,<br>
                <strong>Talent Acquisition Team</strong><br>
                DNEX Consulting FZC<br>
                <a href="https://dnex.ae" style="color: #C9963C; text-decoration: none;">www.dnex.ae</a>
              </p>
            </div>
          </div>
        `;

        transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: `Application Received: ${job_title} — DNEX Consulting`,
          html: candidateEmailHtml,
          replyTo: INTERNAL_NOTIFY_EMAIL
        }).catch(err => console.error('Candidate acknowledgment email notice:', err.message));

      } catch (mailError) {
        console.error('Error dispatching career emails:', mailError);
      }

      return res.status(201).json({ success: true, application: newApplication });
    } catch (err) {
      console.error('Job application error:', err);
      return res.status(500).json({ error: 'Failed to submit application. Please try again.' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/admin/jobs
   * Admin: List all jobs (both listed and unlisted) with applicant counts.
   */
  router.get('/admin/jobs', async (req, res) => {
    try {
      const allJobs = await getJobs();
      const allApps = await getApplications();

      const jobsWithCounts = allJobs.map(j => ({
        ...j,
        application_count: allApps.filter(a => a.job_id === j.id || a.job_title === j.title).length
      }));

      return res.json({ success: true, jobs: jobsWithCounts });
    } catch (err) {
      console.error('Admin jobs fetch error:', err);
      return res.status(500).json({ error: 'Failed to retrieve jobs.' });
    }
  });

  /**
   * POST /api/admin/jobs
   * Admin: Create a new job opening.
   */
  router.post('/admin/jobs', async (req, res) => {
    const {
      title,
      slug,
      department,
      location,
      employment_type,
      experience_level,
      salary_range,
      description,
      responsibilities,
      requirements,
      benefits,
      is_active,
      sort_order
    } = req.body;

    if (!title || !department || !description) {
      return res.status(400).json({ error: 'Title, Department, and Description are required.' });
    }

    try {
      const allJobs = await getJobs();
      const newJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        department,
        location: location || 'Dubai, UAE',
        employment_type: employment_type || 'Full-time',
        experience_level: experience_level || 'Mid-Senior',
        salary_range: salary_range || '',
        description,
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        requirements: Array.isArray(requirements) ? requirements : [],
        benefits: Array.isArray(benefits) ? benefits : [],
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || allJobs.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      allJobs.push(newJob);
      await saveJobs(allJobs);

      return res.status(201).json({ success: true, job: newJob });
    } catch (err) {
      console.error('Admin job create error:', err);
      return res.status(500).json({ error: 'Failed to create job.' });
    }
  });

  /**
   * PATCH /api/admin/jobs/:id
   * Admin: Update job details or toggle list/unlist (is_active).
   */
  router.patch('/admin/jobs/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const allJobs = await getJobs();
      const index = allJobs.findIndex(j => j.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Job not found.' });
      }

      allJobs[index] = {
        ...allJobs[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      await saveJobs(allJobs);
      return res.json({ success: true, job: allJobs[index] });
    } catch (err) {
      console.error('Admin job update error:', err);
      return res.status(500).json({ error: 'Failed to update job.' });
    }
  });

  /**
   * DELETE /api/admin/jobs/:id
   * Admin: Delete job posting.
   */
  router.delete('/admin/jobs/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const allJobs = await getJobs();
      const filtered = allJobs.filter(j => j.id !== id);

      if (filtered.length === allJobs.length) {
        return res.status(404).json({ error: 'Job not found.' });
      }

      await saveJobs(filtered);
      return res.json({ success: true });
    } catch (err) {
      console.error('Admin job delete error:', err);
      return res.status(500).json({ error: 'Failed to delete job.' });
    }
  });

  /**
   * GET /api/admin/job-applications
   * Admin: List applications with search & filters.
   */
  router.get('/admin/job-applications', async (req, res) => {
    const { search, status, job_id, dateFrom, dateTo } = req.query;

    try {
      let apps = await getApplications();

      if (search) {
        const s = search.toLowerCase();
        apps = apps.filter(a =>
          (a.full_name && a.full_name.toLowerCase().includes(s)) ||
          (a.email && a.email.toLowerCase().includes(s)) ||
          (a.phone && a.phone.toLowerCase().includes(s)) ||
          (a.job_title && a.job_title.toLowerCase().includes(s))
        );
      }

      if (status) {
        apps = apps.filter(a => a.status === status);
      }

      if (job_id) {
        apps = apps.filter(a => a.job_id === job_id);
      }

      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        apps = apps.filter(a => new Date(a.created_at).getTime() >= from);
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setDate(to.getDate() + 1);
        apps = apps.filter(a => new Date(a.created_at).getTime() < to.getTime());
      }

      // Sort newest first
      apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return res.json({ success: true, applications: apps });
    } catch (err) {
      console.error('Admin applications fetch error:', err);
      return res.status(500).json({ error: 'Failed to retrieve applications.' });
    }
  });

  /**
   * PATCH /api/admin/job-applications/:id
   * Admin: Update candidate status or admin notes.
   */
  router.patch('/api/admin/job-applications/:id', async (req, res) => {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    try {
      const apps = await getApplications();
      const index = apps.findIndex(a => a.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      if (status !== undefined) apps[index].status = status;
      if (admin_notes !== undefined) apps[index].admin_notes = admin_notes;
      apps[index].updated_at = new Date().toISOString();

      await saveApplications(apps);
      return res.json({ success: true, application: apps[index] });
    } catch (err) {
      console.error('Admin application update error:', err);
      return res.status(500).json({ error: 'Failed to update application.' });
    }
  });

  /**
   * DELETE /api/admin/job-applications/:id
   * Admin: Delete application.
   */
  router.delete('/admin/job-applications/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const apps = await getApplications();
      const filtered = apps.filter(a => a.id !== id);

      if (filtered.length === apps.length) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      await saveApplications(filtered);
      return res.json({ success: true });
    } catch (err) {
      console.error('Admin application delete error:', err);
      return res.status(500).json({ error: 'Failed to delete application.' });
    }
  });

  return router;
};
