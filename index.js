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
}
