/**
 * ANCIENT CASTLE GUARDIANS: ENTRY POINT
 * Initializes canvas, systems, and begins the game loop.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  const ui = new UIManager(game);
  game.init(ui);
  game.start();

  // Periodic UI refresh & auto-save
  setInterval(() => {
    ui.renderHUD();
  }, 100);

  setInterval(() => {
    game.saveProgress();
  }, 5000);
});
