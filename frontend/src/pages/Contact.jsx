import React, { useState } from 'react';
import img1 from "../assets/contact.webp";
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await axios.post('http://localhost:3000/contact-messages', {
        name,
        email,
        subject,
        message,
      });

      Swal.fire({
        icon: "success",
        iconColor: '#059669',
        title: 'Message Sent!',
        text: 'Thank you for contacting us. We will get back to you soon.',
        confirmButtonColor: '#059669'
      });

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire({
        icon: 'error',
        iconColor: '#059669',
        title: 'Oops...',
        text: error.response?.data?.message || 'Something went wrong! Please try again later.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSending(false);
    }
  };


  return (
    <section className='w-full flex mt-[35px] overflow-hidden relative top-[30px] h-[550px] md:h-[550px] lg:h-[650px] xl:h-[750px]'>
      <div className='w-[42%] hidden md:block'>
        <img src={img1} className='w-full h-full object-cover' alt="Contact" />
      </div>
      <div className='w-full md:w-[58%] px-[40px] lg:px-[80px] xl:pt-[80px] animate-fadeInUp'>
        <div className='hidden lg:block'>
          <h1 className='text-[40px] font-semibold p color'>Information About us</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
        </div>
        <div>
          <h1 className='text-[40px] font-semibold p color mt-[40px]'>Get In Touch</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
        </div>

        <form onSubmit={sendMessage} className='mt-[30px] xl:mt-[50px]'>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" name="user_name" placeholder='Your Name' className='input px-4 py-2 lg:py-4' required />
          <div className='flex flex-col md:flex-row'>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="user_email" placeholder='Enter Your Email' className='input w-full md:w-[49%] mr-1 px-4 py-2 lg:py-4' required />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} type="text" name="subject" placeholder='Subject' className='input w-full md:w-[50%] px-4 py-2 lg:py-4' />
          </div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} name="message" placeholder='Your Message' className='input px-4 py-2 lg:py-4' required />
          <button type="submit" disabled={sending} className="btn mt-[20px] lg:mt-[40px] mb-[30px]">{sending ? 'Sending...' : 'Send'}</button>
        </form>
      </div>
    </section>
  );
}
