---
title: Get in Touch
description: Start a conversation. Open to collaboration.
ShowToc: false
---

Start a conversation. Open to collaboration.

<form class="contact-form" action="https://formspree.io/f/xeaqbgbo" method="POST">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" autocomplete="name" placeholder="Your full name" required>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" autocomplete="email" placeholder="you@example.com" required>
  <label for="message">Message</label>
  <textarea id="message" name="message" rows="6" placeholder="What would you like to build?" required></textarea>
  <!-- honeypot: hidden from people, tempting to bots -->
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="form-trap">
  <button type="submit">Send Message</button>
</form>
