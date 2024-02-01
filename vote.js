function submitForm() {
    var email = document.getElementById('emailInput').value;

    if (email.trim() !== "") {
        // Check if the email contains "@" and ".com"
        if (email.includes('@') && email.includes('.com')) {
            window.location.href = "v1.html";
        } else {
            alert("Please enter a valid email address with '@' and '.com'.");
        }
    } else {
        alert("Please enter your email before submitting.");
    }
}