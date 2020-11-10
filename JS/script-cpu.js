var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
document.body.appendChild(canvas);
//const gpu = new GPU();
/////////////////////////////////////////////////////


function randint(min, max) {
    return (Math.floor(Math.random() * (max - min) + min))
}
function Ball(pos, speed, type, color) {
    this.pos = pos;
    this.speed = speed;
    this.type = type;
    this.color = color;
}
function generate_types(ntypes) {
    types = []
    for (i = 0; i < ntypes; ++i) {
        a = []
        for (k = 0; k < ntypes; ++k) {
            force = randint(10, 200) / 20
            attr_len = randint(ball_size ** 3, 500)
            attr_len2 = randint(1, 900)
            a.push([force, attr_len, attr_len2])
        }
        color = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase()
        a.push(color)
        types.push(a)
    }
    return types
}
function create_ball(pos) {
    type = randint(0, ntypes - 1)
    speed = [0, 0]
    ball = new Ball(pos, speed, type, (types[type][types[type].length - 1]))
    balls.push(ball)
}

function calc_spd(pos1, pos2, params) {
    ax = pos2[0] - pos1[0]
    ay = pos2[1] - pos1[1]

    if (ax > this.width * 0.5) {
        ax -= this.width;
    } else if (ax < -this.width * 0.5) {
        ax += this.width;
    }

    if (ay > this.height * 0.5) {
        ay -= this.height;
    } else if (ay < -this.height * 0.5) {
        ay += this.height;
    }

    r2 = ax ** 2 + ay ** 2
    attr1 = params[1]
    attr2 = params[2]

    if (r2 == 0 || r2 > attr2) {
        force = 0
    } else if (r2 < attr1) {
        force = -params[0] / (r2) * 2
    } else {
        force = params[0] / (r2)
    }

    f1 = force * ax
    f2 = force * ay
    return [f1, f2]
}
function update() {
    //console.log(balls)
    for (ball1 of balls) {
        imp = [0, 0]
        for (ball2 of balls) {

            params = types[ball1.type][ball2.type]
            f = calc_spd(ball1.pos, ball2.pos, params)
            imp[0] += f[0]
            imp[1] += f[1]
        }
        ball1.speed[0] += imp[0]
        ball1.speed[1] += imp[1]
    }
    for (ball of balls) {
        ball.pos[0] += ball.speed[0]
        ball.pos[1] += ball.speed[1]
        if (ball.pos[0] > width) { ball.pos[0] -= width }
        if (ball.pos[1] > height) { ball.pos[1] -= height }
        if (ball.pos[0] < 0) { ball.pos[0] += width }
        if (ball.pos[1] < 0) { ball.pos[1] += height }
        ball.speed[0] *= friction
        ball.speed[1] *= friction
    }
}
function draw() {
    ctx.clearRect(0, 0, width, height);
    for (ball of balls) {
        //console.log(ball.pos)
        ctx.beginPath();
        ctx.arc(ball.pos[0], ball.pos[1], ball_size, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }
}


ntypes = 15
ball_size = 4
friction = 0.8



balls = []
types = generate_types(ntypes)
for (i = 0; i < 250; ++i) {
    x = randint(5, width - 5)
    y = randint(5, height - 5)
    create_ball([x, y])
}

time = Date.now()
function main() {
    for (i = 0; i < 1; ++i) {
        update();
        draw();
    }
    //console.log(balls[0].speed)
    fps = Math.floor(1 / ((Date.now() - time) / 1000))
    time = Date.now()
    //console.log(fps)
    window.requestAnimationFrame(main)
}
window.requestAnimationFrame(main)