const amount = document.getElementById('amount')
const apr = document.getElementById('apr')
const years = document.getElementById('years')
const zipcode = document.getElementById('zipcode')
const payment = document.getElementById('payment')
const total = document.getElementById('total')
const totalinterest = document.getElementById('totalinterest')

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
