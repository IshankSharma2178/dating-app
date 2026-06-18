const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
    await transporter.sendMail({
        from: `"HeartSync" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your HeartSync account',
        html: `
            <div style="max-width:520px;margin:40px auto;font-family:sans-serif;background:#fff5f5;border-radius:16px;padding:36px;text-align:center;border:1px solid #ffd6d6;">
                <div style="font-size:40px;margin-bottom:12px;">❤️</div>
                <h1 style="color:#e74c3c;margin:0 0 8px;">Welcome to HeartSync!</h1>
                <p style="color:#666;font-size:15px;line-height:1.6;">Click the button below to verify your email address and start finding your match.</p>
                <a href="${url}" style="display:inline-block;margin:20px 0;padding:14px 36px;background:linear-gradient(135deg,#ff5e7d,#ff2d55);color:#fff;border-radius:30px;text-decoration:none;font-size:16px;font-weight:700;">Verify Email</a>
                <p style="color:#999;font-size:13px;">Or copy this link:<br>${url}</p>
                <p style="color:#999;font-size:12px;margin-top:20px;">This link expires in 1 hour.</p>
            </div>
        `,
    });
};

const sendMatchEmail = async (senderName, partnerName, partnerEmail, details) => {
    await transporter.sendMail({
        from: `"HeartSync" <${process.env.EMAIL_USER}>`,
        to: partnerEmail,
        subject: `You have a date invitation from ${senderName}!`,
        html: `
            <div style="max-width:520px;margin:40px auto;font-family:sans-serif;background:#fff5f5;border-radius:16px;padding:36px;text-align:center;border:1px solid #ffd6d6;">
                <div style="font-size:40px;margin-bottom:12px;">💌</div>
                <h1 style="color:#e74c3c;margin:0 0 8px;">You've been invited on a date!</h1>
                <p style="color:#555;font-size:16px;margin-bottom:20px;"><strong>${senderName}</strong> has invited <strong>${partnerName}</strong> on a date!</p>
                <div style="background:#fff;border-radius:12px;padding:20px;text-align:left;margin:16px 0;">
                    <p style="margin:4px 0;"><strong>Date:</strong> ${details.date}</p>
                    <p style="margin:4px 0;"><strong>Time:</strong> ${details.time}</p>
                    <p style="margin:4px 0;"><strong>Cuisine:</strong> ${details.food || 'Not specified'}</p>
                    <p style="margin:4px 0;"><strong>Location:</strong> ${details.location || 'To be decided'}</p>
                    ${details.notes ? `<p style="margin:4px 0;"><strong>Notes:</strong> ${details.notes}</p>` : ''}
                </div>
                <p style="color:#999;font-size:13px;">Get ready for an amazing time!</p>
                <p style="font-size:28px;margin:0;">❤️</p>
            </div>
        `,
    });
};

const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"HeartSync" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your HeartSync login code',
        html: `
            <div style="max-width:520px;margin:40px auto;font-family:sans-serif;background:#fff5f5;border-radius:16px;padding:36px;text-align:center;border:1px solid #ffd6d6;">
                <div style="font-size:40px;margin-bottom:12px;">❤️</div>
                <h1 style="color:#e74c3c;margin:0 0 8px;">HeartSync Login Code</h1>
                <p style="color:#666;font-size:15px;line-height:1.6;">Use the code below to log in to your account. It expires in 5 minutes.</p>
                <div style="margin:24px 0;padding:16px 32px;background:#ffe5e5;border-radius:12px;display:inline-block;">
                    <span style="font-size:36px;font-weight:800;color:#e74c3c;letter-spacing:8px;">${otp}</span>
                </div>
                <p style="color:#999;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `,
    });
};

module.exports = { sendVerificationEmail, sendMatchEmail, sendOtpEmail };
