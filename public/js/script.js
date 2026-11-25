(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();

// Guest favourite carousel arrows and wishlist hearts.
// Wishlist is stored in this browser only (localStorage), not on the server.
(() => {
  'use strict'

  const scroller = document.getElementById('guestScroller')
  if (scroller) {
    document.querySelectorAll('[data-scroll]').forEach(btn => {
      btn.addEventListener('click', () => {
        const direction = Number(btn.dataset.scroll)
        scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' })
      })
    })
  }

  const KEY = 'wanderlust-wishlist'
  const readSaved = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || []
    } catch (err) {
      return []
    }
  }
  const writeSaved = (ids) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch (err) {
      // Storage unavailable (e.g. private mode): the heart still toggles for this page view
    }
  }

  const saved = new Set(readSaved())
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.dataset.id
    const icon = btn.querySelector('i')

    const render = () => {
      const on = saved.has(id)
      btn.setAttribute('aria-pressed', String(on))
      icon.className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart'
    }

    render()
    btn.addEventListener('click', (event) => {
      event.preventDefault()
      if (saved.has(id)) {
        saved.delete(id)
      } else {
        saved.add(id)
      }
      writeSaved([...saved])
      render()
    })
  })
})()
