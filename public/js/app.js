(function () {
  const toastElement = document.getElementById('appToast');
  const toastBody = toastElement ? toastElement.querySelector('.toast-body') : null;
  const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

  function showToast(message, type = 'primary') {
    if (!toastElement || !toastBody || !toast) return;
    toastBody.textContent = message;
    toastElement.className = `toast align-items-center border-0 text-bg-${type}`;
    toast.show();
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  }

  function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      bootstrap.Modal.getOrCreateInstance(loginModal).show();
    }
  }

  if (window.__SHOW_LOGIN__) {
    openLoginModal();
  }

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await request('/api/user/logout', { method: 'POST', body: JSON.stringify({}) });
        window.location.href = '/';
      } catch (error) {
        showToast(error.message, 'danger');
      }
    });
  });

  const authForm = document.getElementById('authForm');
  if (authForm) {
    const title = authForm.closest('.modal-content').querySelector('[data-auth-title]');
    const submit = authForm.querySelector('[data-auth-submit]');
    const prompt = authForm.querySelector('[data-auth-prompt]');
    const nameField = authForm.querySelector('.auth-name-field');
    const toggle = authForm.querySelector('[data-auth-toggle]');
    const nameInput = authForm.querySelector('[name="name"]');
    const emailInput = authForm.querySelector('[name="email"]');
    const passwordInput = authForm.querySelector('[name="password"]');

    function setMode(mode) {
      authForm.dataset.mode = mode;
      const isRegister = mode === 'register';
      title.textContent = isRegister ? 'Register' : 'Login';
      submit.textContent = isRegister ? 'Create Account' : 'Login';
      prompt.textContent = isRegister ? 'Already have an account?' : 'Create an account?';
      toggle.textContent = isRegister ? 'login here' : 'click here';
      nameField.classList.toggle('d-none', !isRegister);
      nameInput.required = isRegister;
      passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
    }

    toggle.addEventListener('click', () => {
      setMode(authForm.dataset.mode === 'login' ? 'register' : 'login');
    });

    authForm.querySelectorAll('[data-demo-login]').forEach((button) => {
      button.addEventListener('click', () => {
        setMode('login');
        const owner = button.dataset.demoLogin === 'owner';
        emailInput.value = owner ? 'owner@example.com' : 'customer@example.com';
        passwordInput.value = owner ? 'owner123' : 'customer123';
      });
    });

    authForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const mode = authForm.dataset.mode;
      const payload = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
      };

      submit.disabled = true;
      try {
        await request(`/api/user/${mode === 'register' ? 'register' : 'login'}`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast(mode === 'register' ? 'Account created.' : 'Logged in.', 'success');
        window.setTimeout(() => window.location.reload(), 450);
      } catch (error) {
        showToast(error.message, 'danger');
      } finally {
        submit.disabled = false;
      }
    });
  }

  document.querySelectorAll('input[name="pickupDate"]').forEach((pickupInput) => {
    const form = pickupInput.closest('form');
    const returnInput = form ? form.querySelector('input[name="returnDate"]') : null;
    if (!returnInput) return;

    pickupInput.addEventListener('change', () => {
      returnInput.min = pickupInput.value || returnInput.min;
      if (returnInput.value && returnInput.value <= pickupInput.value) {
        returnInput.value = '';
      }
    });
  });

  const bookingForm = document.querySelector('[data-booking-form]');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!window.__CURRENT_USER__) {
        openLoginModal();
        return;
      }

      const button = bookingForm.querySelector('button[type="submit"]');
      const payload = Object.fromEntries(new FormData(bookingForm).entries());
      button.disabled = true;

      try {
        await request('/api/bookings/create', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Booking request submitted.', 'success');
        window.setTimeout(() => {
          window.location.href = '/my-bookings';
        }, 650);
      } catch (error) {
        showToast(error.message, 'danger');
      } finally {
        button.disabled = false;
      }
    });
  }

  const addCarForm = document.querySelector('[data-add-car-form]');
  if (addCarForm) {
    const fileInput = addCarForm.querySelector('input[type="file"]');
    const uploadBox = addCarForm.querySelector('.upload-box span');

    fileInput.addEventListener('change', () => {
      uploadBox.textContent = fileInput.files[0] ? 'Selected' : 'Upload';
    });

    addCarForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = addCarForm.querySelector('button[type="submit"]');
      button.disabled = true;

      try {
        await request('/api/owner/add-car', {
          method: 'POST',
          body: new FormData(addCarForm)
        });
        showToast('Car added successfully.', 'success');
        window.setTimeout(() => {
          window.location.href = '/owner/manage-cars';
        }, 650);
      } catch (error) {
        showToast(error.message, 'danger');
      } finally {
        button.disabled = false;
      }
    });
  }

  document.querySelectorAll('[data-toggle-car]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await request('/api/owner/toggle-car', {
          method: 'POST',
          body: JSON.stringify({ carId: button.dataset.toggleCar })
        });
        showToast('Availability updated.', 'success');
        window.location.reload();
      } catch (error) {
        showToast(error.message, 'danger');
      }
    });
  });

  document.querySelectorAll('[data-delete-car]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!window.confirm('Delete this car?')) return;

      try {
        await request(`/api/owner/cars/${button.dataset.deleteCar}`, {
          method: 'DELETE'
        });
        showToast('Car deleted.', 'success');
        window.location.reload();
      } catch (error) {
        showToast(error.message, 'danger');
      }
    });
  });

  document.querySelectorAll('[data-booking-status]').forEach((select) => {
    select.addEventListener('change', async () => {
      try {
        await request('/api/bookings/change-status', {
          method: 'POST',
          body: JSON.stringify({
            bookingId: select.dataset.bookingStatus,
            status: select.value
          })
        });
        showToast('Booking status updated.', 'success');
      } catch (error) {
        showToast(error.message, 'danger');
      }
    });
  });

  const newsletterForm = document.querySelector('[data-newsletter-form]');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = newsletterForm.querySelector('button');
      button.disabled = true;

      try {
        await request('/api/newsletter', {
          method: 'POST',
          body: JSON.stringify(Object.fromEntries(new FormData(newsletterForm).entries()))
        });
        newsletterForm.reset();
        showToast('Subscribed successfully.', 'success');
      } catch (error) {
        showToast(error.message, 'danger');
      } finally {
        button.disabled = false;
      }
    });
  }
})();
