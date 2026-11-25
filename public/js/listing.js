// Listing detail page: calendar date picking, booking card and show more/less toggles.
(() => {
  'use strict'

  const dataEl = document.getElementById('listing-data')
  if (!dataEl) return

  const data = JSON.parse(dataEl.textContent)
  const $ = (selector) => document.querySelector(selector)

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December']
  const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const pad = (n) => String(n).padStart(2, '0')
  const keyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}` // m is 1-based
  const isKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  const money = (n) => n.toLocaleString('en-IN')

  const now = new Date()
  const todayKey = keyOf(now.getFullYear(), now.getMonth() + 1, now.getDate())

  // Adds one day to a date key, using UTC so time zones can't shift it
  const addDay = (key) => {
    const [y, m, d] = key.split('-').map(Number)
    const next = new Date(Date.UTC(y, m - 1, d + 1))
    return keyOf(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())
  }
  const nightsBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)
  const displayDate = (key) => {
    const [y, m, d] = key.split('-')
    return `${m}/${d}/${y}`
  }

  // A night is blocked when it falls inside an existing booking: checkIn <= night < checkOut
  const isBookedNight = (key) => data.booked.some((b) => b.checkIn <= key && key < b.checkOut)
  const rangeHasBookedNight = (start, end) => {
    for (let key = start; key < end; key = addDay(key)) {
      if (isBookedNight(key)) return true
    }
    return false
  }

  // Selection state
  const prefill = data.prefill || {}
  const hasPrefill = isKey(prefill.checkIn) && isKey(prefill.checkOut) && prefill.checkIn < prefill.checkOut
  const state = {
    start: hasPrefill && prefill.checkIn >= todayKey ? prefill.checkIn : null,
    end: hasPrefill && prefill.checkIn >= todayKey ? prefill.checkOut : null,
    viewMonth: now.getMonth(), // absolute month index: year * 12 + month
  }
  state.viewMonth = now.getFullYear() * 12 + now.getMonth()
  if (state.start) {
    const [y, m] = state.start.split('-').map(Number)
    state.viewMonth = y * 12 + (m - 1)
  }
  const currentMonth = now.getFullYear() * 12 + now.getMonth()

  const showError = (message) => {
    const el = $('#bookingError')
    if (!el) return
    el.textContent = message
    el.hidden = !message
  }

  const syncBookingCard = () => {
    const hasRange = Boolean(state.start && state.end)
    const nights = hasRange ? nightsBetween(state.start, state.end) : 0

    $('#checkInText').textContent = state.start ? displayDate(state.start) : 'Add date'
    $('#checkOutText').textContent = state.end ? displayDate(state.end) : 'Add date'
    $('#checkInInput').value = state.start || ''
    $('#checkOutInput').value = state.end || ''
    $('#reserveBtn').disabled = !hasRange

    const priceLine = $('#priceLine')
    if (nights > 0) {
      priceLine.innerHTML = `&#8377;${money(data.price * nights)} <span>for ${nights} night${nights > 1 ? 's' : ''}</span>`
    } else {
      priceLine.innerHTML = `&#8377;${money(data.price)} <span>night</span>`
    }

    const heading = $('#calendarHeading')
    const sub = $('#calendarSub')
    if (nights > 0) {
      heading.textContent = `${nights} night${nights > 1 ? 's' : ''} in ${data.location}`
      sub.textContent = `${displayDate(state.start)} - ${displayDate(state.end)}`
    } else if (state.start) {
      heading.textContent = 'Select check-out date'
      sub.textContent = `Check-in ${displayDate(state.start)}`
    } else {
      heading.textContent = 'Select check-in date'
      sub.textContent = 'Add your travel dates for exact pricing'
    }
  }

  const buildMonth = (absMonth) => {
    const year = Math.floor(absMonth / 12)
    const month = absMonth % 12 // 0-based
    const wrap = document.createElement('div')
    wrap.className = 'calendar-month'

    const title = document.createElement('div')
    title.className = 'calendar-month-title'
    title.textContent = `${MONTHS[month]} ${year}`
    wrap.appendChild(title)

    const grid = document.createElement('div')
    grid.className = 'calendar-grid'
    WEEKDAYS.forEach((day) => {
      const cell = document.createElement('span')
      cell.className = 'calendar-dow'
      cell.textContent = day
      grid.appendChild(cell)
    })

    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement('span')
      blank.className = 'calendar-blank'
      grid.appendChild(blank)
    }

    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const key = keyOf(year, month + 1, day)
      const past = key < todayKey
      const booked = isBookedNight(key)

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'calendar-day'
      btn.textContent = day
      btn.dataset.key = key

      if (past || booked) {
        btn.disabled = true
        btn.classList.add('is-unavailable')
        btn.setAttribute('aria-label', `${displayDate(key)} unavailable`)
      } else {
        btn.setAttribute('aria-label', displayDate(key))
      }

      if (key === state.start) btn.classList.add('is-start')
      if (key === state.end) btn.classList.add('is-end')
      if (state.start && state.end && key > state.start && key < state.end) btn.classList.add('is-in-range')

      if (!btn.disabled) {
        btn.addEventListener('click', () => selectDay(key))
      }
      grid.appendChild(btn)
    }

    wrap.appendChild(grid)
    return wrap
  }

  const renderCalendar = () => {
    const container = $('#calendarMonths')
    container.innerHTML = ''
    container.appendChild(buildMonth(state.viewMonth))
    container.appendChild(buildMonth(state.viewMonth + 1))
    $('#calPrev').disabled = state.viewMonth <= currentMonth
  }

  const render = () => {
    renderCalendar()
    syncBookingCard()
  }

  const selectDay = (key) => {
    showError('')

    if (!state.start || state.end || key <= state.start) {
      // Start a new selection
      state.start = key
      state.end = null
    } else if (rangeHasBookedNight(state.start, key)) {
      showError('Those dates include unavailable nights. Please choose different dates.')
      state.start = key
      state.end = null
    } else {
      state.end = key
    }
    render()
  }

  const shiftMonth = (delta) => {
    state.viewMonth = Math.max(currentMonth, state.viewMonth + delta)
    renderCalendar()
  }

  // Booking card: date buttons scroll to the calendar
  document.querySelectorAll('[data-pick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      $('#calendarSection').scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })

  $('#calPrev').addEventListener('click', () => shiftMonth(-1))
  $('#calNext').addEventListener('click', () => shiftMonth(1))
  $('#clearDates').addEventListener('click', () => {
    state.start = null
    state.end = null
    showError('')
    render()
  })

  // Guard against submitting a reservation without both dates
  $('#bookingForm').addEventListener('submit', (event) => {
    if (!state.start || !state.end) {
      event.preventDefault()
      showError('Please choose your check-in and check-out dates.')
    }
  })

  // Show more / show less for the description and amenities
  const descToggle = document.querySelector('[data-toggle-description]')
  if (descToggle) {
    const desc = $('#listingDescription')
    descToggle.addEventListener('click', () => {
      const collapsed = desc.classList.toggle('is-collapsed')
      descToggle.textContent = collapsed ? 'Show more' : 'Show less'
    })
  }

  const amenityToggle = document.querySelector('[data-toggle-amenities]')
  if (amenityToggle) {
    const grid = $('#amenityGrid')
    const count = amenityToggle.dataset.count
    amenityToggle.addEventListener('click', () => {
      const expanded = grid.classList.toggle('show-all')
      amenityToggle.textContent = expanded ? 'Show fewer amenities' : `Show all ${count} amenities`
    })
  }

  // Review rating label
  const rating = $('#rating')
  if (rating) {
    rating.addEventListener('input', () => {
      $('#ratingValue').textContent = rating.value
    })
  }

  render()
})()
