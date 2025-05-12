import axios from 'axios';
import * as dotenv from 'dotenv';
import FormData from 'form-data';
dotenv.config();
export class WatiService {
  async sendTemplateMessage(phoneNo: string, payload: any) {
    const disclaimer = `This application is designed to assist healthcare professionals in creating TB treatment regimens, aligning with National TB Management Guidelines. It functions as a decision-support tool and should not replace the expertise of qualified medical professionals.The Clinical Decision Support System (CDSS) within the app is intended to aid in regimen development, but ultimate medical decisions must be made by healthcare providers.Always consult a qualified healthcare provider for accurate diagnosis and personalized treatment recommendations.The information provided in this app is for reference purposes only and should not be used as a sole source for medical decision-making. The use of this app is subject to specific terms and conditions.`;
    const apiUrl = `${process.env.WATI_URL}/sendTemplateMessage?whatsappNumber=${phoneNo}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: process.env.WATI_AUTH_TOKEN,
    };
    const body = {
      broadcast_name: 'TemplateBroadcast',
      parameters: [
        { name: 'name', value: payload.name },
        { name: 'diagnosis', value: payload.diagnosis },
        { name: 'regimen', value: payload.regimen },
        {
          name: 'prescription',
          value: payload.prescription.replace(/\n/g, ' '),
        },
        { name: 'nottes', value: payload.notes.replace(/\n/g, ' ') },
        { name: 'disclaimer', value: disclaimer },
      ],
      template_name: 'priscriptionv16',
      phone_number: phoneNo,
    };
    console.log('before fetch and call url -----?');
    try {
      const response1 = await axios.post(apiUrl, body, { headers });
      if (response1.status !== 200) {
        throw new Error(`Request failed with status code ${response1.status}`);
      }
      console.log('Successful --->');
    } catch (error) {
      console.error('Error performing operation:', error);
    }
  }

  async sendSessionFile(phoneNo: string, payload: any) {
    console.log(`Send PDF to phoneNo ${phoneNo}`);
    const apiUrl = `${process.env.WATI_URL}/sendSessionFile/${phoneNo}?caption=WATI DOC`;
    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: process.env.WATI_AUTH_TOKEN,
    };
    const chunks: any[] = [];
    payload.on('data', (chunk) => chunks.push(chunk));
    payload.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const base64Pdf = pdfBuffer.toString('base64');

      // Step 2: Send the PDF to WATI
      const form = new FormData();
      form.append('media', base64Pdf, {
        filename: `Prescription.pdf`,
        contentType: 'application/pdf',
      });
      form.append('caption', 'WATI PDF');
    });
    const body = {
      file: payload,
    };
    try {
      const response1 = await axios.post(apiUrl, body, { headers });
      if (response1.status !== 200) {
        throw new Error(`Request failed with status code ${response1.status}`);
      }
      console.log('Successful --->');
    } catch (error) {
      console.error('Error performing operation:', error);
    }
  }

  async sendPdfTemplate(phoneNo: string, stream: any, userName: string) {
    const apiUrl = `${process.env.WATI_URL}/sendTemplateMessage?whatsappNumber=${phoneNo}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: process.env.WATI_AUTH_TOKEN,
    };
    const body = {
      broadcast_name: 'MediaTemplateBroadcast',
      parameters: [{ name: 'name', value: userName }],
      template_name: 'precription_v5',
      phone_number: phoneNo,
      media: {
        link: process.env.AWS_URL + stream.data[0],
        filename: 'prescription.pdf',
        type: 'document',
      },
    };
    console.log('before fetch and call url -----?');
    try {
      const response1 = await axios.post(apiUrl, body, { headers });
      if (response1.status !== 200) {
        throw new Error(`Request failed with status code ${response1.status}`);
      }
      console.log('Successful --->');
    } catch (error) {
      console.error('Error performing operation:', error);
    }
  }
}
