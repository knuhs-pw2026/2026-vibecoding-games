// ============================================================================
// 과일 합치기 (수박게임) 모듈 버전
// ============================================================================

import { FRUITS, drawFruit, drawGhostFruit } from './fruits.js';
import { soundFX } from './audio.js';
import { ParticleSystem } from './particles.js';

// Standalone game.js가 메인으로 구동되며, 모듈 환경에서도 호환성을 유지합니다.
export { FRUITS, drawFruit, drawGhostFruit, soundFX, ParticleSystem };
