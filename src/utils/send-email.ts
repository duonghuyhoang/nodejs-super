import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'

config()

// Tạo SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!
  }
})

// Định nghĩa type cho tham số hàm createSendEmailCommand
interface EmailParams {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}

/**
 * Tạo lệnh gửi email với SES
 * @param {EmailParams} params - Các thông tin cần để gửi email
 * @returns {SendEmailCommand} - Lệnh gửi email của AWS SES
 */
const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: EmailParams): SendEmailCommand => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: Array.isArray(ccAddresses) ? ccAddresses : [ccAddresses],
      ToAddresses: Array.isArray(toAddresses) ? toAddresses : [toAddresses]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: Array.isArray(replyToAddresses) ? replyToAddresses : [replyToAddresses]
  })
}

/**
 * Gửi email xác thực qua AWS SES
 * @param {string} toAddress - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} body - Nội dung email (HTML)
 * @returns {Promise<any>} - Kết quả từ AWS SES
 */
const sendVerifyEmail = async (toAddress: string, subject: string, body: string): Promise<any> => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS!,
    toAddresses: toAddress,
    body,
    subject
  })

  try {
    return await sesClient.send(sendEmailCommand)
  } catch (error) {
    console.error('Failed to send email.', error)
    throw new Error('Email sending failed')
  }
}

// Gửi thử email
sendVerifyEmail('huyhoangdz2003@gmail.com', 'Test email', '<h1>Content email</h1>')
  .then((response) => console.log('Email sent successfully:', response))
  .catch((error) => console.error('Error sending email:', error))
