import { MapPin, Phone, Mail, Clock, Send, ChevronLeft } from "lucide-react";
import { useState } from "react";
import "./Contact.css";

export default function Contact({ navigate }) {
  const [form, setForm] = useState({ name:"", phone:"", email:"", course:"", message:"" });
  const [sent, setSent] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = () => { if(form.name && form.phone) setSent(true); };

  return (
    <div className="contact-page">
      <div className="back-home-wrapper">
        <button className="btn-back-home" onClick={() => navigate("home")}>
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>
      <div className="page-hero">
        <h1>Contact <span>Us</span></h1>
        <p>We're here to help you choose the right path. Reach out anytime.</p>
      </div>
      <div className="contact-body">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>Visit us at our center or reach out online. Our counsellors are available 7 days a week.</p>
          <div className="info-items">
            <div className="info-item">
              <div className="ii-icon"><MapPin size={20}/></div>
              <div>
                <div className="ii-label">Address</div>
                <div>Near Chinna Anjaneya Swamy Temple, Danavaipeta, Rajahmundry, Andhra Pradesh</div>
              </div>
            </div>
            <div className="info-item">
              <div className="ii-icon"><Phone size={20}/></div>
              <div>
                <div className="ii-label">Phone</div>
                <div>+91 88335 XXXXX</div>
              </div>
            </div>
            <div className="info-item">
              <div className="ii-icon"><Mail size={20}/></div>
              <div>
                <div className="ii-label">Email</div>
                <div>info@kracademy.in</div>
              </div>
            </div>
            <div className="info-item">
              <div className="ii-icon"><Clock size={20}/></div>
              <div>
                <div className="ii-label">Hours</div>
                <div>Mon–Sat: 8am – 8pm &nbsp;|&nbsp; Sun: 10am – 2pm</div>
              </div>
            </div>
          </div>
          <div className="map-placeholder">
            <MapPin size={28} color="var(--blue)"/>
            <span>KR Institute of Learning — Rajahmundry</span>
          </div>
        </div>

        <div className="contact-form-card">
          {sent ? (
            <div className="form-success">
              <div className="success-icon">✅</div>
              <h3>Enquiry Sent!</h3>
              <p>Our team will call you back within 24 hours. Thank you!</p>
            </div>
          ) : (
            <>
              <h3>Send an Enquiry</h3>
              <div className="form-fields">
                <div className="field-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handle} placeholder="Your name"/>
                </div>
                <div className="field-group">
                  <label>Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX"/>
                </div>
                <div className="field-group">
                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handle} placeholder="your@email.com"/>
                </div>
                <div className="field-group">
                  <label>Interested Course</label>
                  <select name="course" value={form.course} onChange={handle}>
                    <option value="">-- Select Course --</option>
                    <option>Banking Foundation Batch</option>
                    <option>SSC CGL Complete Batch</option>
                    <option>Railway NTPC Crash Course</option>
                    <option>AP/Telangana State Exams</option>
                    <option>Clerk Level Banking Batch</option>
                    <option>Insurance Sector Bundle</option>
                  </select>
                </div>
                <div className="field-group full">
                  <label>Message</label>
                  <textarea name="message" value={form.message} onChange={handle} placeholder="Any questions or special requirements..." rows={4}/>
                </div>
                <button className="btn-submit" onClick={submit}><Send size={16}/>Submit Enquiry</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
