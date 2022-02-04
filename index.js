const amount = document.getElementById('amount')
const apr = document.getElementById('apr')
const years = document.getElementById('years')
const zipcode = document.getElementById('zipcode')
const payment = document.getElementById('payment')
const total = document.getElementById('total')
const totalinterest = document.getElementById('totalinterest')
const graph = document.getElementById('graph')

function calculate() {
  const principal = parseFloat(amount.value)
  const interest = parseFloat(apr.value) / 100 / 12
  const payments = parseFloat(years.value) * 12

  const x = Math.pow(1 + interest, payments)
  const monthly = (principal * x * interest) / (x - 1)

  if (isFinite(monthly)) {
    payment.innerHTML = monthly.toFixed(2)
    total.innerHTML = (monthly * payments).toFixed(2)
    totalinterest.innerHTML = (monthly * payments - principal).toFixed(2)
    save(amount.value, apr.value, years.value, zipcode.value)

    try {
      getLenders(amount.value, apr.value, years.value, zipcode.value)
    } catch(e) {}

    chart(principal, interest, monthly, payments)
  } else {
    payment.innerHTML = ''
    total.innerHTML = totalinterest.innerHTML = ''
  }
}

function save(amount, apr, years, zipcode) {
  if (window.localStorage) {
    localStorage.loan_amount = amount
    localStorage.loan_apr = apr
    localStorage.loan_years = years
    localStorage.loan_zipcode = zipcode
  }
}

window.onload = function() {
  if (window.localStorage && localStorage.loan_amount) {
    amount.value = localStorage.loan_amount
    apr.value = localStorage.loan_apr
    years.value = localStorage.loan_years
    zipcode.value = localStorage.loan_zipcode
  }
}

function getLenders(amount, apr, years, zipcode) {
  if (!window.XMLHttpRequest) return
  const ad = document.getElementById('lenders')
  if (!ad) return
  const url = 'getLenders.php' + '?amt=' + encodeURIComponent(amount) + '&apr=' + encodeURIComponent(apr) + '&yrs=' + encodeURIComponent(years) + '&zip=' + encodeURIComponent(zipcode)

  const req = new XMLHttpRequest()
  req.open('GET', url)
  req.send(null)
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      const response = req.responseText
      const lenders = JSON.parse(response)
      let list = ''

      for (let i = 0; i < lenders.length; i++) {
        list += '<li><a href="' + lenders[i].url + '">' + lenders[i].name + '</a></li>'
      }

      ad.innerHTML = '<ul>' + list + '</ul>'
    }
  }
}

function chart(principal, interest, monthly, payments) {
  graph.width = graph.width
  if (arguments.length == 0 || !graph.getContext) return
  const g = graph.getContext('2d')
  const width = graph.width, height = graph.height

  function paymentToX(n) {
    return n * width / payments
  }

  function amountToY(a) {
    return height - (a * height / (monthly * payments * 1.05))
  }

  g.moveTo(paymentToX(0), amountToY(0))
  g.lineTo(paymentToX(payments), amountToY(monthly * payments))
  g.lineTo(paymentToX(payments), amountToY(0))
  g.closePath()
  g.fillStyle = '#f88'
  g.fill()
  g.font = 'bold 12px sans-serif'
  g.fillText('Total interest payments', 20, 20)

  let equity = 0;
  g.beginPath()
  g.moveTo(paymentToX(0), amountToY(0))

  for (let p = 1; p <= payments; p++) {
    const thisMonthsInterest = (principal - equity) * interest
    equity += monthly - thisMonthsInterest
    g.lineTo(paymentToX(p), amountToY(equity))
  }

  g.lineTo(paymentToX(payments), amountToY(0))
  g.closePath()
  g.fillStyle = 'green'
  g.fill()
  g.fillText('Total equity', 20, 35)

  let bal = principal
  g.beginPath()
  g.moveTo(paymentToX(0), amountToY(bal))

  for (let p = 1; p <= payments; p++) {
    const thisMonthInterest = bal * interest
    bal -= monthly - thisMonthInterest
    g.lineTo(paymentToX(p), amountToY(bal))
  }

  g.lineWidth = 3
  g.stroke()
  g.fillStyle = 'black'
  g.fillText('Loan Balance', 20, 50)
  g.textAlign = 'center'
  const y = amountToY(0)

  for (let year = 1; year * 12 <= payments; year ++) {
    const x = paymentToX(year * 12)
    g.fillRect(x - 0.5, y - 3, 1, 3)
    if (year == 1) g.fillText('Year', x, y - 5)
    if (year % 5 == 0 && year * 12 !== payments) {
      g.fillText(String(year), x, y - 5)
    }
  }

  g.textAlign = 'right'
  g.textBaseLine = 'middle'
  const ticks = [monthly * payments, principal]
  const rightEdge = paymentToX(payments)

  for (let i = 0; i < ticks.length; i++) {
    const y = amountToY(ticks[i])
    g.fillRect(rightEdge - 3, y - 0.5, 3, 1)
    g.fillText(ticks[i].toFixed(0), rightEdge - 5, y)
  }
}
