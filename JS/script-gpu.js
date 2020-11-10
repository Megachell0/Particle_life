var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const gpu = new GPU();
/////////////////////////////////////////////////////
function randint(min, max) { // рандом
    return (Math.floor(Math.random() * (max - min) + min))
}
const range = (start, stop, step = 1) =>
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

function generate_types(num) { // Генератор типов частиц
    var types = []
    for (i = 0; i < (num); i++) {
        var type = []
        for (k = 0; k < (num); ++k) {
            var force = randint(force_start, force_end) / 10               // Сила притяжения
            var attr_len = randint(attr1_start * particle_size * 3, attr1_end)    // дальность отталкивания
            var attr_len2 = randint(attr2_start, attr2_end)                 // дальность притяжения
            type.push([force, attr_len, attr_len2])
        }
        var color = [randint(0, 255), randint(0, 255), randint(0, 255)]
        type.push(color)
        types.push(type)
    }
    return types
}
function create_particle(x, y) {
    type = randint(0, ntypes) // выбираем тип частицы
    particle = [x, y, 0, 0, type, (particle_types[type][ntypes])]  // координаты x,y, скорость 0,0, тип частицы, цвет
    particles.push(particle)
}

const calc_speed = gpu.createKernel(function (a, b, len, width, height, particle_types, ntypes) { // считаем скорость
    let forces = [0, 0]
    for (let i = 0; i < len; i++) {
        let ax = b[i][0] - a[this.thread.x][0] // расстояние по x
        let ay = b[i][1] - a[this.thread.x][1] // расстояние по y

        //////////////////////// сложный поиск правил взаимодействия
        let col = a[i][4] * ntypes * 3 + (a[i][4] * 3)
        let row = b[this.thread.x][4] * 3
        let id = col + row
        let rules = [particle_types[id], particle_types[id + 1], particle_types[id + 2]] //правила взаимодействия (см. generate_types)
        let force = 0

        ///////////////////////// Зацикливание экрана
        if (ax > width * 0.5) {
            ax -= width;
        } else if (ax < -width * 0.5) {
            ax += width;
        }

        if (ay > height * 0.5) {
            ay -= height;
        } else if (ay < -height * 0.5) {
            ay += height;
        }
        /////////////////////////// 

        let r2 = ax ** 2 + ay ** 2 // квадрат расстояния
        if (r2 == 0 || r2 > rules[2]) {
            force = 0
        } else if (r2 < rules[1]) {
            force = -rules[0] / (r2) * 0.1    //рассчет отталкивания
        } else {
            force = rules[0] / (r2)         //рассчет притяжения
        }

        let f1 = force * ax;    //задаем направление скорости
        let f2 = force * ay;
        forces[0] += f1
        forces[1] += f2
    }
    return (forces)
}).setOutput([30000]);

function update() {
    imp = calc_speed(particles, particles, num_particles, width, height, particle_types.flat(15), ntypes).slice(0, num_particles) // считаем общую скорость частицы
    for (let i = 0; i < particles.length; i++) {

        particles[i][2] += imp[i][0]    // обновляем скорость
        particles[i][3] += imp[i][1]

        particles[i][0] += particles[i][2]    // обновляем координаты
        particles[i][1] += particles[i][3]

        if (particles[i][0] > width) { particles[i][0] -= width }    // проверка выхода за экран
        if (particles[i][1] > height) { particles[i][1] -= height }
        if (particles[i][0] < 0) { particles[i][0] += width }
        if (particles[i][1] < 0) { particles[i][1] += height }

        particles[i][2] *= friction    // считаем трение
        particles[i][3] *= friction
    }
}
function draw() {   //отрисовка
    ctx.clearRect(0, 0, width, height);    // очистка экрана
    for (particle of particles) {
        ctx.beginPath();
        ctx.arc(Math.floor(particle[0]), Math.floor(particle[1]), particle_size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgb(${particle[5]})`;
        ctx.fill();
        ctx.closePath();
    }
}
function create_particles() {
    particle_types = []
    particle_types = generate_types(ntypes)
    particles = []
    for (i = 0; i < num_particles; ++i) {
        x = randint(0, width)       // начальные координаты
        y = randint(0, height)
        create_particle(x, y)
    }
}

// количество типов
particle_size = 5 // размер частицы
friction = 0.8      // трение

force_start = 230
force_end = 1200
attr1_start = 125
attr1_end = 300
attr2_start = 425
attr2_end = 2275
//#####################################

num_particles = 11000 // размер массива 
ntypes = 99


let mySlider1 = new rSlider({
    target: '#slider1',
    values: range(0, 1500, 10),
    range: true,
    set: [force_start, force_end], // an array of preselected values
    width: null,
    scale: false,
    labels: false,
    tooltip: true,
    step: null, // step size
    disabled: false, // is disabled?
    onChange: (function (values) {
        val = values.split(",")
        force_start = val[0];
        force_end = val[1];
        create_particles()
    }),// restart() // callback
});
let mySlider2 = new rSlider({
    target: '#slider2',
    values: (range(0, 1500, 25)),
    range: true,
    set: [attr1_start, attr1_end], // an array of preselected values
    width: null,
    scale: false,
    labels: false,
    tooltip: true,
    step: null, // step size
    disabled: false, // is disabled?
    onChange: (function (values) {
        val = values.split(",")
        attr1_start = val[0];
        attr1_end = val[1];
        create_particles()
    }),// restart() // callback
});
let mySlider3 = new rSlider({
    target: '#slider3',
    values: range(0, 3002, 25),
    range: true,
    set: [attr2_start, attr2_end], // an array of preselected values
    width: null,
    scale: false,
    labels: false,
    tooltip: true,
    step: null, // step size
    disabled: false, // is disabled?
    onChange: (function (values) {
        val = values.split(",")
        attr2_start = val[0];
        attr2_end = val[1];
        create_particles()
    }),// restart() // callback
});

function reset() {
    particle_size = document.getElementById('text1').value;
    friction = document.getElementById('text2').value;
    ntypes = document.getElementById('text3').value;
    if (ntypes > 90) {
        ntypes = 90
        document.getElementById('text3').value = 90
    }
    num_particles = document.getElementById('text4').value;
    if (num_particles > 10000) {
        num_particles = 9990
        document.getElementById('text4').value = 10000
    }
    create_particles()
}

create_particles()
update()

num_particles = 250 // стандартные настройки
ntypes = 7

//#####################################
document.getElementById('text1').value = particle_size
document.getElementById('text2').value = friction
document.getElementById('text3').value = ntypes
document.getElementById('text4').value = num_particles
//#####################################

time = Date.now()
function main() {
    fps = Math.floor(1 / ((Date.now() - time) / 1000))  //счетчик fps
    time = Date.now()
    update();
    draw();
    window.requestAnimationFrame(main)
}
setTimeout(main, 500)



