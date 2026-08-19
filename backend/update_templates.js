require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const templates = await prisma.$queryRawUnsafe('SELECT * FROM system_templates');
  
  // Extract LOGO_BASE64 from the frontend file
  const logoBase64File = fs.readFileSync('../frontend/src/app/crm/utils/logoBase64.ts', 'utf-8');
  let logoBase64 = '';
  const match = logoBase64File.match(/export const LOGO_BASE64 = "(.*?)";/);
  if (match) {
    logoBase64 = match[1];
  } else {
    console.error("Could not find LOGO_BASE64 string in logoBase64.ts");
    process.exit(1);
  }
  
  for (const tpl of templates) {
    let updatedBody = tpl.body;
    
    // Update phone numbers
    updatedBody = updatedBody.replace(/\+971 55 554 2841/g, '+971 551251185');
    updatedBody = updatedBody.replace(/971555542841/g, '971551251185');
    
    // Replace text headers with the logo image (using cid:dnex-logo)
    const oldHeaderHTML = `<h1 style="margin:0;color:#C9963C;font-size:26px;letter-spacing:1px">DNex</h1>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:13px">Business Setup Consultants</p>`;
    const newHeaderHTML = `<img src="cid:dnex-logo" alt="DNex Logo" style="height:48px; object-fit:contain; margin-bottom:8px;" />`;
    
    // Check if the old base64 is in there and replace it with cid
    updatedBody = updatedBody.replace(`<img src="${logoBase64}"`, '<img src="cid:dnex-logo"');
    
    updatedBody = updatedBody.replace(oldHeaderHTML, newHeaderHTML);
    
    // Also replace any other "DNex Business Setup Consultants" if any
    updatedBody = updatedBody.replace(/<h2 style="margin:0;color:#C9963C;font-size:18px">DNex<\/h2>/g, newHeaderHTML);
    
    // Remove India number
    const indiaBlock = `<tr><td style="padding:3px 0;font-size:13px;color:#64748b">📞 India</td>
                  <td style="font-size:13px;color:#0D2137">+91 88517 42425</td></tr>`;
    updatedBody = updatedBody.replace(indiaBlock, '');
    
    // Make header background white
    updatedBody = updatedBody.replace(
      '<td style="background:#0D2137;padding:32px 40px;text-align:center">',
      '<td style="background:#ffffff;padding:32px 40px;text-align:center;border-bottom:1px solid #e2e8f0;">'
    );
    updatedBody = updatedBody.replace(
      '<td style="background:#0D2137;padding:24px 32px">',
      '<td style="background:#ffffff;padding:24px 32px;border-bottom:1px solid #e2e8f0;">'
    );
    // Adjust header text color in Internal Lead Alert
    updatedBody = updatedBody.replace(
      '<p style="margin:4px 0 0;color:#94a3b8;font-size:12px">',
      '<p style="margin:4px 0 0;color:#64748b;font-size:12px">'
    );
    
    await prisma.$executeRawUnsafe(
      'UPDATE system_templates SET body = $1 WHERE id = $2::uuid',
      updatedBody,
      tpl.id
    );
    console.log(`Updated template: ${tpl.name}`);
  }
  console.log("Done updating system_templates!");
}
main().finally(() => prisma.$disconnect());
