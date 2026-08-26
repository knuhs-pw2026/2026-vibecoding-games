/**
 * CYBER STRIKE 2099 - Procedural Canvas Texture Generator
 * Dynamically builds sci-fi metallic, circuit, hazard, and emissive textures with bright, crisp clarity.
 */

const TextureGenerator = {
    // 1. Cyber Grid Floor Texture (Brightened & Crisp)
    createFloorTexture: function(size = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Bright high-tech metallic floor
        ctx.fillStyle = '#222d42';
        ctx.fillRect(0, 0, size, size);

        // Brushed metal highlights
        for (let i = 0; i < 3000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
            ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 6, 1);
        }

        // Metal Panel Borders
        const panelSize = size / 4;
        ctx.strokeStyle = '#3d4f73';
        ctx.lineWidth = 4;
        for (let x = 0; x <= size; x += panelSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }
        for (let y = 0; y <= size; y += panelSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }

        // Glowing Cyan Sub-grid Inset
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.lineWidth = 2;
        const subGrid = size / 16;
        for (let x = 0; x <= size; x += subGrid) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, x);
            ctx.lineTo(size, x);
            ctx.stroke();
        }

        // Corner Rivets/Bolts on Panels
        ctx.fillStyle = '#5c78aa';
        for (let x = panelSize / 2; x < size; x += panelSize) {
            for (let y = panelSize / 2; y < size; y += panelSize) {
                const offsets = [-panelSize / 2 + 10, panelSize / 2 - 10];
                offsets.forEach(ox => {
                    offsets.forEach(oy => {
                        ctx.beginPath();
                        ctx.arc(x + ox, y + oy, 3.5, 0, Math.PI * 2);
                        ctx.fill();
                    });
                });
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    // 2. Sci-Fi Wall Panels Texture (Brightened)
    createWallTexture: function(size = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Brightened wall base
        ctx.fillStyle = '#26334d';
        ctx.fillRect(0, 0, size, size);

        // Armor Plate Bevels
        ctx.fillStyle = '#36496e';
        ctx.fillRect(20, 20, size - 40, size / 2 - 30);
        ctx.fillRect(20, size / 2 + 10, size - 40, size / 2 - 30);

        // Panel Inset Borders
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(20, 20, size - 40, size / 2 - 30);
        ctx.strokeRect(20, size / 2 + 10, size - 40, size / 2 - 30);

        // Tech Circuit Traces
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 12;

        // Circuit Line 1
        ctx.beginPath();
        ctx.moveTo(30, 80);
        ctx.lineTo(120, 80);
        ctx.lineTo(160, 120);
        ctx.lineTo(340, 120);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(340, 120, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff';
        ctx.fill();

        // Circuit Line 2
        ctx.beginPath();
        ctx.moveTo(size - 30, size - 80);
        ctx.lineTo(size - 140, size - 80);
        ctx.lineTo(size - 180, size - 120);
        ctx.lineTo(120, size - 120);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(120, size - 120, 6, 0, Math.PI * 2);
        ctx.fill();

        // Decals
        ctx.shadowBlur = 0;
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = 'rgba(0, 243, 255, 0.85)';
        ctx.fillText('SECTOR-09 // CYBER ARENA', 35, size / 2 - 20);
        ctx.fillText('HIGH VOLTAGE SHIELD', 35, size - 35);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    // 3. Sci-Fi Tech Crate Texture
    createCrateTexture: function(size = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#2c3b54';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#1c2636';
        ctx.fillRect(0, 0, size, 30);
        ctx.fillRect(0, size - 30, size, 30);
        ctx.fillRect(0, 0, 30, size);
        ctx.fillRect(size - 30, 0, 30, size);

        ctx.fillStyle = '#3a4c6b';
        ctx.fillRect(50, 50, size - 100, size - 100);

        // Hazard Stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(30, 30, size - 60, 25);
        ctx.rect(30, size - 55, size - 60, 25);
        ctx.clip();

        ctx.fillStyle = '#ffbb00';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#222';
        for (let x = -size; x < size * 2; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 25, 0);
            ctx.lineTo(x - 15, size);
            ctx.lineTo(x - 40, size);
            ctx.fill();
        }
        ctx.restore();

        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#00f3ff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CRATE', size / 2, size / 2);

        return new THREE.CanvasTexture(canvas);
    },

    // 4. Jump Pad Glowing Ring Texture
    createJumpPadTexture: function(size = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0d1d2b';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 100, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#00ff88';
        for (let i = 0; i < 3; i++) {
            const y = size / 2 + 25 - i * 25;
            ctx.beginPath();
            ctx.moveTo(size / 2, y - 15);
            ctx.lineTo(size / 2 + 25, y + 10);
            ctx.lineTo(size / 2 - 25, y + 10);
            ctx.closePath();
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // 5. Glow Sprite
    createGlowSpriteTexture: function(color = '#00f3ff') {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, color);
        grad.addColorStop(0.7, 'rgba(0, 100, 255, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        return new THREE.CanvasTexture(canvas);
    }
};

window.TextureGenerator = TextureGenerator;
