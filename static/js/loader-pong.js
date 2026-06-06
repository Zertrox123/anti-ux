window.LoaderPong = (function () {
    'use strict';

    function start(canvas, container, opts) {
        if (!canvas) return function () {};

        opts = opts || {};
        const loadCount = Math.max(1, opts.loadCount || 1);
        const speedMul = Math.min(4, 1 + (loadCount - 1) * 0.32);

        const ctx = canvas.getContext('2d');
        const PADDLE_W = 16;
        const PADDLE_H = 100;
        const BALL_R = 9;
        const MARGIN = 28;
        const AI_SPEED = 4.8 * speedMul;
        const BASE_VX = 7.5 * speedMul;
        const BASE_VY = 5.2 * speedMul;
        const MAX_VY = 11 * speedMul;

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
                vx = BASE_VX * (Math.random() < 0.5 ? 1 : -1);
                vy = BASE_VY * (Math.random() < 0.5 ? 1 : -1);
            }
        }

        function onMove(e) {
            const rect = canvas.getBoundingClientRect();
            if (!rect.height) return;
            mouseY = e.clientY - rect.top;
        }

        function onTouch(e) {
            if (e.touches && e.touches[0]) onMove(e.touches[0]);
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
                vx = BASE_VX * (Math.random() < 0.5 ? 1 : -1);
                vy = BASE_VY * (Math.random() < 0.5 ? 1 : -1);
            }

            vy = clamp(vy, -MAX_VY, MAX_VY);
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
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('touchmove', onTouch, { passive: true });
        window.addEventListener('touchstart', onTouch, { passive: true });
        loop();

        return function stop() {
            running = false;
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onTouch);
            window.removeEventListener('touchstart', onTouch);
        };
    }

    return { start: start };
})();
