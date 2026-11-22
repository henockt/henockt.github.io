---
title: Get in Touch
description: Start a conversation. Open to collaboration.
ShowToc: false
---

<form class="contact-form" id="contactForm" action="https://formspree.io/f/xeaqbgbo" method="POST">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" autocomplete="name" placeholder="Your full name" required>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" autocomplete="email" placeholder="you@example.com" required>
  <label for="message">Message</label>
  <textarea id="message" name="message" rows="6" placeholder="What would you like to build?" required></textarea>
  <!-- honeypot: hidden from people, tempting to bots -->
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="form-trap">
  <button type="submit">Send Message</button>
  <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
</form>

<script>
(function () {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const button = form.querySelector('button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = 'Thanks, your message is on its way.';
      status.classList.add('ok');
    } catch (err) {
      status.textContent = 'Something went wrong. Please reach me on GitHub instead.';
      status.classList.add('error');
    } finally {
      button.disabled = false;
      button.textContent = 'Send Message';
    }
  });
})();
</script>
