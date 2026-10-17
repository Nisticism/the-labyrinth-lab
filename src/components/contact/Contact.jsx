import React, { useState } from 'react';
import Seo from '../seo/Seo';
import './contact.css';

const API_BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

function Contact() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.target;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      message: String(data.get('message') || '').trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
        console.error('[contact] submit failed:', responseBody?.error || res.statusText);
      }
    } catch (error) {
      setStatus('error');
      console.error('[contact] network error:', error);
    }
  };

  return (
    <div className="contact-page">
      <Seo
        title="Contact"
        path="/contact"
        description="Get in touch with The Labyrinth Lab to discuss a custom woodworking commission, ask a question, or say hello."
      />
      <div className="contact-card">
        <h1 className="contact-heading">Get In Touch</h1>
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