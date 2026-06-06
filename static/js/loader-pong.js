/* Mini ping-pong pendant le chargement — fond blanc, barres & balle noires */

window.LoaderPong = (function () {
    'use strict';

    function start(canvas, container) {
        if (!canvas) return function () {};

        const ctx = canvas.getContext('2d');
        const PADDLE_W = 16;
        const PADDLE_H = 100;
        const BALL_R = 9;
        const MARGIN = 28;
        const AI_SPEED = 4.2;

        let w = 0;
        let h = 0;
        let leftY = 0;
        let rightY = 0;
        let ballX = 0;
        let ballY = 0;
        let vx = 0;
        let vy = 0;
        let mouseY = null;
        let animId = 0;
        let running = true;

        function resize() {
            w = container.clientWidth;
            h = container.clientHeight;
            canvas.width = w;
            canvas.height = h;
            if (leftY === 0) {
                leftY = h / 2 - PADDLE_H / 2;
                rightY = h / 2 - PADDLE_H / 2;
                ballX = w / 2;
                ballY = h / 2;
                vx = 5 * (Math.random() < 0.5 ? 1 : -1);
                vy = 3.5 * (Math.random() < 0.5 ? 1 : -1);
            }
        }

        function onMove(e) {
            const rect = canvas.getBoundingClientRect();
            mouseY = e.clientY - rect.top;
        }

        function onTouch(e) {
            if (e.touches[0]) onMove(e.touches[0]);
        }

        function clamp(v, min, max) {
            return Math.max(min, Math.min(max, v));
        }

        function update() {
            if (mouseY !== null) {
                leftY += (mouseY - PADDLE_H / 2 - leftY) * 0.22;
            }
            leftY = clamp(leftY, 10, h - PADDLE_H - 10);

            const target = ballY - PADDLE_H / 2;
            if (rightY < target - 8) rightY += AI_SPEED;
            else if (rightY > target + 8) rightY -= AI_SPEED;
            rightY = clamp(rightY, 10, h - PADDLE_H - 10);

            ballX += vx;
            ballY += vy;

            if (ballY - BALL_R <= 0 || ballY + BALL_R >= h) {
                vy *= -1;
                ballY = clamp(ballY, BALL_R, h - BALL_R);
            }

            const lx = MARGIN;
            if (ballX - BALL_R <= lx + PADDLE_W && vx < 0 &&
                ballY >= leftY && ballY <= leftY + PADDLE_H) {
                vx = Math.abs(vx) * 1.04;
                vy += (ballY - (leftY + PADDLE_H / 2)) * 0.08;
                ballX = lx + PADDLE_W + BALL_R;
            }

            const rx = w - MARGIN - PADDLE_W;
            if (ballX + BALL_R >= rx && vx > 0 &&
                ballY >= rightY && ballY <= rightY + PADDLE_H) {
                vx = -Math.abs(vx) * 1.04;
                vy += (ballY - (rightY + PADDLE_H / 2)) * 0.08;
                ballX = rx - BALL_R;
            }

            if (ballX < -30 || ballX > w + 30) {
                ballX = w / 2;
                ballY = h / 2;
                vx = 5 * (Math.random() < 0.5 ? 1 : -1);
                vy = 3.5 * (Math.random() < 0.5 ? 1 : -1);
            }

            vy = clamp(vy, -9, 9);
        }

        function draw() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#111111';
            ctx.fillRect(MARGIN, leftY, PADDLE_W, PADDLE_H);
            ctx.fillRect(w - MARGIN - PADDLE_W, rightY, PADDLE_W, PADDLE_H);

            ctx.beginPath();
            ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
            ctx.fill();

            ctx.setLineDash([6, 10]);
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w / 2, 0);
            ctx.lineTo(w / 2, h);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function loop() {
            if (!running) return;
            update();
            draw();
            animId = requestAnimationFrame(loop);
        }

        resize();
        window.addEventListener('resize', resize);
        container.addEventListener('mousemove', onMove);
        container.addEventListener('touchmove', onTouch, { passive: true });
        loop();

        return function stop() {
            running = false;
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousemove', onMove);
            container.removeEventListener('touchmove', onTouch);
        };
    }

    return { start: start };
})();
