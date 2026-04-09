import React, { useState } from 'react';
import './contact.css';

function Contact() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.target;
    const data = new FormData(form);
    try {
      const res = await fetch('https://formsubmit.co/ajax/labyrinthlabs0@gmail.com', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        <h2 className="contact-heading">Get In Touch</h2>
        <p className="contact-subtext">
          Have a question, want to discuss a custom piece, or just want to say hello?
          Fill out the form below and I'll get back to you as soon as I can.
        </p>
        {status === 'sent' ? (
          <div className="contact-success">
            <h3>Message Sent!</h3>
            <p>Thanks for reaching out. I'll get back to you soon.</p>
            <button className="contact-btn" onClick={() => setStatus('idle')}>Send Another Message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_subject" value="New message from the-ll.com" />
            <div className="contact-row">
              <div className="contact-field">
                <label htmlFor="name">Name</label>
                <input type="text" name="name" id="name" placeholder="Your name" required />
              </div>
              <div className="contact-field">
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="contact-field">
              <label htmlFor="message">Message</label>
              <textarea name="message" id="message" placeholder="What can I help you with?" rows="8" required></textarea>
            </div>
            <button type="submit" className="contact-btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'error' && <p className="contact-error">Something went wrong. Please try again.</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default Contact;