'use strict'

module.exports.sendConfirm = function (event, context) {
  //
  // Identify why was this function invoked
  if (event.triggerSource === 'CustomMessage_SignUp') {
    // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
    const code = event.request.codeParameter
    const email = encodeURIComponent(event.request.userAttributes.email)
    const url = `${process.env.PROTOCOL}://${process.env.DOMAIN_NAME}/confirm-registration?code=${code}&email=${email}`
    event.response.smsMessage = `Welcome to the service. Your confirmation code is ${event.request.codeParameter}`
    event.response.emailSubject = 'Welcome to the ties.network'
    event.response.emailMessage = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns😨="urn:schemas-microsoft-com🏢office">
  <head>
    <!— This is a simple example template that you can edit to create your own custom templates —>
    <!--[if gte mso 15]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG />
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <meta charset="UTF-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
  <style type="text/css">
    a{
      color:#333333;
      text-decoration:none;
    }
    a:hover{
      color:yellow;
    }
</style></head>
  <body style="margin:0;padding:0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="color:#000000;height:100%;margin:0;padding:0;font-family:Arial, Helvetica, sans-serif;" bgcolor="#e7e7e7">
      <tr>
        <td>
          <center>
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="height:151px;margin:0;padding:0;border-bottom:1px solid #e7e7e7;" bgcolor="#ffffff" background="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/bb75d6e7-b1ab-4fde-a3b1-e8b853a63567.png">
              <tr>
                <td style="padding:20px 0 0 110px;text-align:left;" valign="top">
                  <a href="https://ties.network/?utm_sourse=email&amp;utm_medium=release_alfa" target="_blank"><img alt="" src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/e119e022-cda6-4856-a554-9752d68d71ef.png" border="0"></a>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 0 170px;color:#000000;font-size:12px;text-align:left;" valign="top">
                  Decentralized business platform both for <br>crypto commuinity and for ordinary businesses
                </td>
              </tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="height:330px;margin:0;padding:0;border-bottom:1px solid #e7e7e7;" bgcolor="#ffffff" background="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/fd413812-6aa3-4cb2-881a-87f2d2644e18.png">
              <tr>
                <td style="text-align:center;padding:50px 0 10px 0;">
                  <img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/f5a3393d-24c7-42d7-b344-739d0f6fe719.png" alt="">
                </td>
              </tr>
              <tr>
              <td style="padding:0 30px;text-align:center;color:#000000;height:200px;" valign="middle">
                <h2 style="display:block;font-size:24px;">Thank you for registering with Ties.Network. </h2>
                <p style="display:block;font-size:15px;margin-bottom:40px;">
Now you have your personal account on our platform. This account will let you participate in Token Generation Event and take part in token distribution. Please click this link to confirm your registration.
				</p>
                <center>
                  <a href=\"${url}\" target="_blank" style="margin-bottom: 20px;display:block;width:160px;height:35px;line-height:35px;font-size:16px;color:#e6332a;text-transform:uppercase;font-weight:bold;border:2px solid #e6332a;text-align:center;">
				  Confirm
				  </a>
                </center>
              </td>
            </tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="height:254px;margin:0;padding:0;" bgcolor="#FFFFFF" background="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/ea1c9cbd-334c-41ae-8023-c42449ee7ad4.png">
              <tr>
                <td style="padding:20px 30px 0 30px;color:#000000;text-align:center;" valign="top">
                  <h2 style="font-size:24px;font-weight:bold;line-height:1.2;">Follow us in social networks</h2>
                  <p>Explore all the latest news, interviews, event reports and project updates<br> in our official groups and channel project updates.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 100px 0 100px;" valign="top">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;text-align:center;">
                    <tr>
                      <td>
<a href="https://www.linkedin.com/company-beta/18035770/" target="_blank"><img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/17aadab8-e504-4ccc-9da1-9093f9ca562a.png" alt="" border="0"></a>
                      </td>
                      <td>
                        <a href="https://t.me/tiesnetwork" target="_blank"><img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/46d85aeb-141f-4dda-8569-57cc0352304a.png" alt="" border="0"></a>
                      </td>
                      <td>
                        <a href="https://www.facebook.com/tiesdb" target="_blank"><img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/04114660-20ac-437a-a0a3-312406e22f88.png" alt="" border="0"></a>
                      </td>
                      <td>
                        <a href="https://github.com/tiesnetwork" target="_blank"><img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/98e95f6a-b892-4eb7-8cf1-dc8b23f5a3ad.png" alt="" border="0"></a>
                      </td>
                      <td>
                        <a href="https://twitter.com/tiesnetwork" target="_blank"><img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/b2ccb9b2-7f65-42d0-93a4-2949d9857d99.png" alt="" border="0"></a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="margin:0;padding:0;">
              <tr>
                <td valign="middle" style="padding:20px 0 20px 0;font-size:12px;">
                  <a href="https://ties.network/?utm_sourse=email&amp;utm_medium=release_alfa" target="_blank" style="text-decoration:underline;"><img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/066d391b-50a6-4574-8ff0-fea3ee8cf1dd.png" alt="" style="border:none;vertial-align:middle;padding-right:4px;">Ties.Network</a>
                </td>
                <td valign="middle" style="padding:20px 0 20px 0;font-size:12px;">
                  <a href="mailto:info@ties.network" target="_blank" style="text-decoration:underline;"><img src="https://gallery.mailchimp.com/f312e525f83cc0edb85e1d294/images/e978d0ba-1e89-4b87-9610-0173bea96c07.png" alt="" style="border:none;vertial-align:middle;padding-right:4px;">info@ties.network</a>
                </td>
                <td valign="middle" style="padding:20px 0 20px 0;font-size:12px;">Ties.Network © 2017</td>
                <td valign="middle" style="text-align:right;">
                  <a href="*|UNSUB|*" target="_blank" style="text-decoration:underline;font-size:14px;">UNSUBSCRIBE</a>
                </td>
              </tr>
            </table>
          </center>
        </td>
      </tr>
    </table>
  </body>
</html>`
    // Create custom message for other events
    // Customize messages for other user pools

    //
  }
  // Return result to Cognito
  context.done(null, event)
}
