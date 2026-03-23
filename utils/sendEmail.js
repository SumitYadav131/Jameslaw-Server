import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });


    // const transporter = nodemailer.createTransport({
    //     host: "smtp.gmail.com",
    //     port: 587,
    //     secure: false,
    //     auth: {
    //         user: process.env.EMAIL_USER,
    //         pass: process.env.EMAIL_PASS
    //     },
    //     tls: {
    //         rejectUnauthorized: false
    //     },
    //     connectionTimeout: 10000, // 10 sec
    // });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
}