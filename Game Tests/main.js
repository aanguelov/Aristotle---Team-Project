var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

ctx.beginPath();
ctx.arc(400, 600, 40, 0, Math.PI, true);
ctx.stroke();

ctx.moveTo(395, 561);
ctx.lineTo(395, 530);
ctx.lineTo(405, 530);
ctx.lineTo(405, 561);
ctx.stroke();
