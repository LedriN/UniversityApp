const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { generateStudentsExcel, generateExcelFilename } = require('./excelGenerator');

// Generate a random password
const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex');
};

// Create transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email configuration not found. Skipping email sending.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
  });
};

// Send welcome email with password for students
const sendWelcomeEmail = async (studentEmail, studentName, username, password) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (email not configured), return success to not block student creation
    if (!transporter) {
      console.log('⚠️ Email not configured. Student created without email notification.');
      return { success: true, skipped: true, reason: 'Email not configured' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Mirë Se Vini në Universitetin FAMA - Kredencialet tuaja',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Mirëseerdhët në Universitetin FAMA!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0;">
                Përshëndetje <strong>${studentName}</strong>,
              </p>
              <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 10px 0;">
                Llogaria juaj e studentit është krijuar me sukses! Më poshtë janë kredencialet tuaja për hyrje në sistemin e universitetit.
              </p>
            </div>
            
            <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Kredencialet tuaja:</h3>
              <div style="margin-bottom: 15px;">
                <strong style="color: #34495e;">👤 Username:</strong>
                <span style="color: #2c3e50; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">${username}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #34495e;">🔑 Fjalëkalimi:</strong>
                <span style="color: #2c3e50; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">${password}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #34495e;">📧 Email:</strong>
                <span style="color: #2c3e50; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">${studentEmail}</span>
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Informacion i rëndësishëm:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Ruajni këto kredenciale në një vend të sigurt</li>
                <li>Mos ndani këto kredenciale me askënd tjetër</li>
                <li>Nëse keni probleme, kontaktoni administratorin</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                Faleminderit që zgjodhët Universitetin FAMA!<br>
                Ju urojmë sukses në studimet tuaja!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                Ky email është dërguar automatikisht nga sistemi i Universitetit FAMA.<br>
                Ju lutemi mos përgjigjuni këtij email-i.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send user credentials email for admin/staff users
const sendUserCredentialsEmail = async (userEmail, username, password, role) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (email not configured), return success to not block user creation
    if (!transporter) {
      console.log('⚠️ Email not configured. User created without email notification.');
      return { success: true, skipped: true, reason: 'Email not configured' };
    }
    
    const roleDisplay = role === 'admin' ? 'Administrator' : role === 'staff' ? 'Staf' : 'Student';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Kredencialet tuaja për Sistemin e Universitetit FAMA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Mirëseerdhët në Sistemin e Universitetit FAMA!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0;">
                Llogaria juaj si <strong>${roleDisplay}</strong> është krijuar me sukses! Më poshtë janë kredencialet tuaja për hyrje në sistemin e universitetit.
              </p>
            </div>
            
            <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Kredencialet tuaja:</h3>
              <div style="margin-bottom: 15px;">
                <strong style="color: #34495e;">👤 Username:</strong>
                <span style="color: #2c3e50; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">${username}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #34495e;">🔑 Fjalëkalimi:</strong>
                <span style="color: #2c3e50; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">${password}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #34495e;">📧 Email:</strong>
                <span style="color: #2c3e50; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">${userEmail}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #34495e;">👨‍💼 Roli:</strong>
                <span style="color: #2c3e50; font-family: monospace; background-color: #ffffff; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">${roleDisplay}</span>
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Informacion i rëndësishëm:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Ruajni këto kredenciale në një vend të sigurt</li>
                <li>Mos ndani këto kredenciale me askënd tjetër</li>
                <li>Ndryshoni fjalëkalimin pas hyrjes së parë</li>
                <li>Nëse keni probleme, kontaktoni administratorin</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                Faleminderit për kontributin tuaj në Universitetin FAMA!<br>
                Ju urojmë sukses në punën tuaj!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                Ky email është dërguar automatikisht nga sistemi i Universitetit FAMA.<br>
                Ju lutemi mos përgjigjuni këtij email-i.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ User credentials email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending user credentials email:', error);
    return { success: false, error: error.message };
  }
};

// Send admin notification email with Excel attachment when new student is added
const sendAdminNotificationEmail = async (adminEmail, newStudentName, newStudentEmail) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (email not configured), return success to not block student creation
    if (!transporter) {
      console.log('⚠️ Email not configured. Admin notification skipped.');
      return { success: true, skipped: true, reason: 'Email not configured' };
    }

    // Generate Excel file with all students
    const excelBuffer = await generateStudentsExcel();
    const filename = generateExcelFilename();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'Student i ri u shtua - Lista e përditësuar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">📝 Student i ri u shtua në sistem</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0;">
                Përshëndetje!
              </p>
              <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 10px 0;">
                Thjesht të njoftoj që një student i ri është regjistruar në sistemin e Universitetit FAMA.
              </p>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">👤 Detajet e studentit të ri:</h3>
              <div style="margin-bottom: 10px;">
                <strong style="color: #155724;">Emri:</strong>
                <span style="color: #155724; margin-left: 10px;">${newStudentName}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #155724;">Email:</strong>
                <span style="color: #155724; margin-left: 10px;">${newStudentEmail}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #155724;">Data e regjistrimit:</strong>
                <span style="color: #155724; margin-left: 10px;">${new Date().toLocaleDateString('sq-AL')}</span>
              </div>
            </div>
            
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 18px;">📊 Lista e përditësuar e studentëve</h3>
              <p style="color: #0c5460; font-size: 14px; line-height: 1.6; margin: 0;">
                Kam bashkangjitur një skedar Excel me bazën e të dhënave të përditësuar të studentëve, duke përfshirë edhe këtë student të ri. 
                Kjo të jep pamjen e plotë të të gjithë studentëve të regjistruar në sistem.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📋 Çfarë përmban skedari Excel:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Të gjitha të dhënat e studentëve (emrat, email-at, numrat e telefonit)</li>
                <li>Statusi i pagesave dhe shumat</li>
                <li>Detajet e programit dhe viti akademik</li>
                <li>Datat e regjistrimit dhe komentet</li>
                <li>Informacioni i plotë i kontaktit</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                Ky email u gjenerua automatikisht nga sistemi i Universitetit FAMA.<br>
                Mbaje këtë skedar Excel për regjistrat e tu!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                Sistemi i Menaxhimit të Universitetit FAMA<br>
                Njoftim automatik - Nuk ka nevojë për përgjigje
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: excelBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generatePassword,
  sendWelcomeEmail,
  sendUserCredentialsEmail,
  sendAdminNotificationEmail
}; 