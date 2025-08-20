const Customer = require('../models/Customer');
const Labor = require('../models/Labor');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;

// Configure NodeMailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const loginUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user;

    // Fetch user based on role
    if (role === 'Customer') {
      user = await Customer.findOne({ username });
    } else if (role === 'Labor') {
      user = await Labor.findOne({ username });
    } else if (role === 'Admin') {
      user = await Admin.findOne({ username });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (!user) return res.status(404).json({ error: `${role} not found` });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

    // If Customer, handle 2-step verification
    if (role === 'Customer') {
      user.lastLogin = new Date();
      await user.save();

      if (user.twoStepEnabled) {
        const code = generateVerificationCode();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        user.verificationCode = code;
        user.codeExpiresAt = expiry;
        await user.save();

        // Send email
        await transporter.sendMail({
        from: `"LaborLink" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔐 Your Verification Code',
        html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4; padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #ddd;">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="background:#5e17eb; padding:30px;">
                    <img src="https://img.icons8.com/external-flatart-icons-flat-flatarticons/64/ffffff/external-security-web-security-flatart-icons-flat-flatarticons.png" width="60" alt="Security Icon" style="display:block;" />
                    <h2 style="color:#ffffff; font-family:Arial, sans-serif; margin:10px 0 0; font-size:24px;">Two-Step Verification</h2>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:30px; font-family:Arial, sans-serif; color:#333333; text-align:center;">
                    <p style="font-size:16px; margin:0 0 10px;">Hello <strong>${user.username}</strong>,</p>
                    <p style="font-size:15px; margin:0 0 20px;">Use the code below to complete your login:</p>
                    
                    <div style="background:#f2f0ff; border:2px dashed #5e17eb; border-radius:6px; padding:15px; display:inline-block;">
                      <span style="font-size:28px; font-weight:bold; letter-spacing:6px; color:#5e17eb; font-family:monospace;">${code}</span>
                    </div>
                    
                    <p style="font-size:13px; color:#777777; margin:20px 0 0;">
                      This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#777777; font-family:Arial, sans-serif;">
                    © ${new Date().getFullYear()} LaborLink | Secure Access
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        `
      });
        return res.status(200).json({
          message: 'Verification code sent to your email',
          requiresVerification: true,
          userId: user._id,
          email: user.email,
        });
      }

      // 2-step disabled → issue JWT
      const payload = { id: user._id, username: user.username, role: 'Customer' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

      return res.status(200).json({
        message: 'Customer login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: 'Customer',
        },
        twoStepEnabled: false,
      });
    }

    // For Labor and Admin (no 2-step)
    const payload = {
      id: user._id,
      username: user.username,
      role: role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: `${role} login successful`,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  loginUser,
};
