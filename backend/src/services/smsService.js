// backend/src/services/smsService.js - Optimized Version
const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  // Format Indian phone number
  formatPhoneNumber(phone) {
    let cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('91')) {
      cleanPhone = '91' + cleanPhone;
    }
    
    return '+' + cleanPhone;
  }

  // Validate message length for trial accounts
  validateMessageLength(message) {
    const hasUnicode = /[^\x00-\x7F]/.test(message);
    const maxLength = hasUnicode ? 70 : 160;
    
    return {
      isValid: message.length <= maxLength,
      length: message.length,
      maxLength: maxLength,
      segments: Math.ceil(message.length / maxLength)
    };
  }

  // Send EFIR creation notification (SHORTENED)
  async sendEfirCreatedMessage(phone, efirData) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // SHORTENED MESSAGE - Under 160 characters
      const message = `🚨 EFIR Filed
ID: ${efirData._id.toString().slice(-6)}
Tourist: ${efirData.touristId}
Status: ${efirData.status.toUpperCase()}
Location: ${efirData.locationInfo?.nearestCity || 'NE India'}

Processing started.
Emergency: 112`;

      // Validate length
      const validation = this.validateMessageLength(message);
      if (!validation.isValid) {
        console.warn(`Message too long: ${validation.length}/${validation.maxLength} chars`);
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`SMS sent successfully: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send EFIR verification notification (SHORTENED)
  async sendEfirVerifiedMessage(phone, efirData, assignedOfficer) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // SHORTENED MESSAGE - Under 160 characters
      const message = `✅ EFIR Verified
ID: ${efirData._id.toString().slice(-6)}
Officer: ${assignedOfficer.name}
Badge: ${assignedOfficer.badgeNumber}
Phone: ${assignedOfficer.phone}

You'll be contacted soon.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send status update notification (SHORTENED)
  async sendStatusUpdateMessage(phone, efirId, oldStatus, newStatus, additionalInfo = '') {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const statusEmojis = {
        pending: '⏳',
        verified: '✅',
        sent: '🚀',
        resolved: '✅',
        closed: '🔒'
      };

      // SHORTENED MESSAGE
      const message = `${statusEmojis[newStatus] || '📋'} Status Update
EFIR: ${efirId.toString().slice(-6)}
${oldStatus.toUpperCase()} → ${newStatus.toUpperCase()}

${additionalInfo ? additionalInfo.substring(0, 50) + '...' : 'Check app for details.'}`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Optional: Send detailed info as follow-up message
  async sendDetailedEfirInfo(phone, efirData) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const message = `EFIR Details:
Full ID: ${efirData._id}
Tourist ID: ${efirData.touristId}
Location: ${efirData.locationInfo?.nearestCity}
Helplines: 112, 1363`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Follow-up SMS failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check message delivery status
  async checkMessageStatus(messageId) {
    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateSent: message.dateSent,
        price: message.price
      };
    } catch (error) {
      console.error('Error checking message status:', error);
      return { error: error.message };
    }
  }
}

module.exports = new SMSService();
