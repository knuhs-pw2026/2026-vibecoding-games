// ============================================================================
// 과일 데이터 정의 및 캔버스 렌더러 (체리부터 수박까지 11단계)
// ============================================================================

export const FRUITS = [
  {
    id: 0,
    name: '체리',
    englishName: 'Cherry',
    radius: 18,
    score: 2,
    color: '#FF2A55',
    secondaryColor: '#C9002B',
    leafColor: '#4CAF50',
    highlight: '#FFAEC0',
    details: 'cherry'
  },
  {
    id: 1,
    name: '딸기',
    englishName: 'Strawberry',
    radius: 26,
    score: 4,
    color: '#FF3B30',
    secondaryColor: '#B00014',
    leafColor: '#2E7D32',
    highlight: '#FF9E99',
    details: 'strawberry'
  },
  {
    id: 2,
    name: '포도',
    englishName: 'Grape',
    radius: 35,
    score: 8,
    color: '#9C27B0',
    secondaryColor: '#5B0E68',
    leafColor: '#388E3C',
    highlight: '#CE93D8',
    details: 'grape'
  },
  {
    id: 3,
    name: '귤',
    englishName: 'Tangerine',
    radius: 45,
    score: 16,
    color: '#FFA502',
    secondaryColor: '#E67E22',
    leafColor: '#43A047',
    highlight: '#FFEAA7',
    details: 'tangerine'
  },
  {
    id: 4,
    name: '감',
    englishName: 'Persimmon',
    radius: 56,
    score: 32,
    color: '#FF6F00',
    secondaryColor: '#D84315',
    leafColor: '#33691E',
    highlight: '#FFB74D',
    details: 'persimmon'
  },
  {
    id: 5,
    name: '사과',
    englishName: 'Apple',
    radius: 68,
    score: 64,
    color: '#EA2027',
    secondaryColor: '#960E13',
    leafColor: '#2ED573',
    highlight: '#FF7675',
    details: 'apple'
  },
  {
    id: 6,
    name: '배',
    englishName: 'Pear',
    radius: 81,
    score: 128,
    color: '#ECC06C',
    secondaryColor: '#C28E25',
    leafColor: '#2E7D32',
    highlight: '#FFF3B0',
    details: 'pear'
  },
  {
    id: 7,
    name: '복숭아',
    englishName: 'Peach',
    radius: 95,
    score: 256,
    color: '#FF7597',
    secondaryColor: '#D83A64',
    leafColor: '#43A047',
    highlight: '#FFD3DF',
    details: 'peach'
  },
  {
    id: 8,
    name: '파인애플',
    englishName: 'Pineapple',
    radius: 110,
    score: 512,
    color: '#FBC531',
    secondaryColor: '#E19C00',
    leafColor: '#10AC84',
    highlight: '#FEF1B5',
    details: 'pineapple'
  },
  {
    id: 9,
    name: '멜론',
    englishName: 'Melon',
    radius: 126,
    score: 1024,
    color: '#A3CB38',
    secondaryColor: '#6B8E23',
    leafColor: '#2F701E',
    highlight: '#DDF786',
    details: 'melon'
  },
  {
    id: 10,
    name: '수박',
    englishName: 'Watermelon',
    radius: 145,
    score: 2048,
    color: '#2ED573',
    secondaryColor: '#0E733B',
    insideColor: '#FF3838',
    highlight: '#7BED9F',
    details: 'watermelon'
  }
];

// 플레이어가 직접 투하할 수 있는 최대 과일 단계 (0: 체리 ~ 3: 귤)
export const MAX_DROP_LEVEL = 3;

/**
 * 캔버스에 과일을 커스텀 렌더링하는 함수
 */
export function drawFruit(ctx, fruitData, x, y, angle, squashX = 1, squashY = 1, impactIntensity = 0, time = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(squashX, squashY);

  const r = fruitData.radius;

  // 1. 수박(최종 단계)일 때 신비로운 황금빛 오라 글로우
  if (fruitData.id === 10) {
    ctx.save();
    ctx.shadowColor = 'rgba(46, 213, 115, 0.9)';
    ctx.shadowBlur = 24 + Math.sin(time * 0.005) * 8;
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(46, 213, 115, 0.25)';
    ctx.fill();
    ctx.restore();
  }

  // 2. 기본 과일 바디 구형 그라데이션
  const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r);
  grad.addColorStop(0, fruitData.highlight || '#FFF');
  grad.addColorStop(0.35, fruitData.color);
  grad.addColorStop(1, fruitData.secondaryColor);

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // 과일 외곽선
  ctx.lineWidth = Math.max(2, r * 0.045);
  ctx.strokeStyle = fruitData.secondaryColor;
  ctx.stroke();

  // 3. 과일별 고유 디테일 패턴
  drawFruitSpecificDetails(ctx, fruitData, r, time);

  // 4. 빛 반사 하이라이트 (Glossy 광택)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-r * 0.42, -r * 0.42, r * 0.26, r * 0.13, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
  ctx.fill();
  ctx.restore();

  // 5. 귀여운 표정 (Face)
  drawFruitFace(ctx, fruitData, r, impactIntensity, time);

  // 6. 잎사귀 / 꼭지 (Top Decor)
  drawFruitTop(ctx, fruitData, r);

  ctx.restore();
}

/**
 * 예상 착지 지점에 표시될 반투명 고스트 과일 렌더러
 */
export function drawGhostFruit(ctx, fruitData, x, y, isMergeChance = false, time = 0) {
  ctx.save();
  ctx.translate(x, y);

  const r = fruitData.radius;
  const pulse = Math.sin(time * 0.008) * 2;

  // 1. 착지 영역 베이스 및 섀도우
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = isMergeChance ? 'rgba(255, 215, 0, 0.22)' : 'rgba(255, 255, 255, 0.18)';
  ctx.fill();

  // 외곽선 (점선 테두리)
  ctx.lineWidth = isMergeChance ? 3.5 : 2.2;
  ctx.strokeStyle = isMergeChance ? '#FFD700' : fruitData.color;
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.restore();

  // 2. 중앙 타겟 십자선 마커
  ctx.save();
  ctx.strokeStyle = isMergeChance ? 'rgba(255, 215, 0, 0.85)' : 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 2;
  const crossSize = Math.min(14, r * 0.3);
  ctx.beginPath();
  ctx.moveTo(-crossSize, 0);
  ctx.lineTo(crossSize, 0);
  ctx.moveTo(0, -crossSize);
  ctx.lineTo(0, crossSize);
  ctx.stroke();
  ctx.restore();

  // 3. 합성 찬스 발생 시 반짝이는 안내 뱃지
  if (isMergeChance) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
    ctx.shadowBlur = 10;
    ctx.font = `900 ${Math.max(11, Math.round(r * 0.28))}px 'Jua', 'Noto Sans KR', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#B33939';
    ctx.lineWidth = 3.5;
    ctx.strokeText('✨ 합체 가능!', 0, -r - 12 + pulse);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('✨ 합체 가능!', 0, -r - 12 + pulse);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * 과일별 고유 텍스처 및 무늬
 */
function drawFruitSpecificDetails(ctx, fruitData, r, time) {
  switch (fruitData.details) {
    case 'strawberry': {
      // 딸기 씨앗
      ctx.fillStyle = '#FFEAA7';
      const seeds = [
        [-0.4, -0.2], [0.3, -0.2], [-0.1, 0.1], 
        [-0.5, 0.4], [0.4, 0.4], [0, 0.6], [0.2, -0.6], [-0.2, -0.6]
      ];
      seeds.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.ellipse(sx * r, sy * r, r * 0.04, r * 0.07, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'grape': {
      // 포도알 입체 엠보싱 원
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      const grapes = [
        [-0.4, -0.3], [0.4, -0.3], [-0.5, 0.2], [0.5, 0.2], [0, 0.5]
      ];
      grapes.forEach(([gx, gy]) => {
        ctx.beginPath();
        ctx.arc(gx * r, gy * r, r * 0.26, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'tangerine': {
      // 귤 질감 (미세한 점들)
      ctx.fillStyle = 'rgba(211, 84, 0, 0.22)';
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * r * 0.65, Math.sin(ang) * r * 0.65, r * 0.04, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'persimmon': {
      // 감 사등분 음영
      ctx.strokeStyle = 'rgba(216, 67, 21, 0.3)';
      ctx.lineWidth = r * 0.04;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0);
      ctx.lineTo(r * 0.7, 0);
      ctx.moveTo(0, -r * 0.7);
      ctx.lineTo(0, r * 0.7);
      ctx.stroke();
      break;
    }
    case 'apple': {
      // 사과 꼭지 안쪽 음영
      ctx.beginPath();
      ctx.arc(0, -r * 0.75, r * 0.18, 0, Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fill();
      break;
    }
    case 'peach': {
      // 복숭아 골 (골짜기 라인)
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.95);
      ctx.bezierCurveTo(-r * 0.15, 0, -r * 0.1, r * 0.6, 0, r * 0.95);
      ctx.strokeStyle = 'rgba(216, 58, 100, 0.4)';
      ctx.lineWidth = r * 0.05;
      ctx.stroke();
      break;
    }
    case 'pineapple': {
      // 파인애플 다이아몬드 격자 무늬
      ctx.strokeStyle = 'rgba(200, 130, 0, 0.35)';
      ctx.lineWidth = Math.max(1.5, r * 0.035);
      const step = r * 0.35;
      for (let x = -r; x <= r; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, -r);
        ctx.lineTo(x + r, r);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, -r);
        ctx.lineTo(x - r, r);
        ctx.stroke();
      }
      break;
    }
    case 'melon': {
      // 멜론 그물망 텍스처
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = Math.max(1.5, r * 0.032);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.moveTo(Math.cos(ang) * r * 0.9, Math.sin(ang) * r * 0.9);
        ctx.quadraticCurveTo(0, 0, Math.cos(ang + Math.PI) * r * 0.9, Math.sin(ang + Math.PI) * r * 0.9);
      }
      ctx.stroke();
      break;
    }
    case 'watermelon': {
      // 수박 검은 녹색 곡선 줄무늬
      ctx.strokeStyle = '#0B4D26';
      ctx.lineWidth = r * 0.11;
      ctx.lineCap = 'round';
      const stripes = [-0.65, -0.35, 0, 0.35, 0.65];
      stripes.forEach(sx => {
        ctx.beginPath();
        ctx.moveTo(sx * r, -Math.sqrt(Math.max(0, r * r - (sx * r) ** 2)) * 0.9);
        ctx.quadraticCurveTo(sx * r * 1.3, 0, sx * r, Math.sqrt(Math.max(0, r * r - (sx * r) ** 2)) * 0.9);
        ctx.stroke();
      });

      // 반짝이는 축하 별 파티클 효과
      const rot = time * 0.002;
      ctx.fillStyle = '#FFF';
      for (let i = 0; i < 4; i++) {
        const ang = rot + (i * Math.PI) / 2;
        const dist = r * 0.65;
        const px = Math.cos(ang) * dist;
        const py = Math.sin(ang) * dist;
        drawSparkle(ctx, px, py, r * 0.12);
      }
      break;
    }
  }
}

function drawSparkle(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x, y, x + size, y);
  ctx.quadraticCurveTo(x, y, x, y + size);
  ctx.quadraticCurveTo(x, y, x - size, y);
  ctx.quadraticCurveTo(x, y, x, y - size);
  ctx.fill();
}

/**
 * 귀여운 표정 그리기 (눈, 볼터치, 입)
 */
function drawFruitFace(ctx, fruitData, r, impactIntensity, time) {
  const eyeOffset = r * 0.32;
  const eyeY = -r * 0.05;
  const eyeSize = Math.max(2, r * 0.09);

  // 눈 깜빡임 로직 (약 3~4초마다 깜빡)
  const blinkCycle = (time + fruitData.id * 800) % 3500;
  const isBlinking = blinkCycle < 140;

  // 볼터치 (Blush)
  ctx.fillStyle = 'rgba(255, 80, 100, 0.42)';
  ctx.beginPath();
  ctx.arc(-eyeOffset * 1.1, eyeY + r * 0.18, r * 0.14, 0, Math.PI * 2);
  ctx.arc(eyeOffset * 1.1, eyeY + r * 0.18, r * 0.14, 0, Math.PI * 2);
  ctx.fill();

  if (impactIntensity > 0.5) {
    // 1. 충돌 시 놀라는 표정 (> < 혹은 ㅇ 0 ㅇ)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = Math.max(2, r * 0.06);
    ctx.lineCap = 'round';
    
    // 왼쪽 눈 (> 모양)
    ctx.beginPath();
    ctx.moveTo(-eyeOffset - eyeSize, eyeY - eyeSize);
    ctx.lineTo(-eyeOffset + eyeSize * 0.5, eyeY);
    ctx.lineTo(-eyeOffset - eyeSize, eyeY + eyeSize);
    ctx.stroke();

    // 오른쪽 눈 (< 모양)
    ctx.beginPath();
    ctx.moveTo(eyeOffset + eyeSize, eyeY - eyeSize);
    ctx.lineTo(eyeOffset - eyeSize * 0.5, eyeY);
    ctx.lineTo(eyeOffset + eyeSize, eyeY + eyeSize);
    ctx.stroke();

    // 둥근 벌린 입 (O 모양)
    ctx.beginPath();
    ctx.arc(0, eyeY + r * 0.22, r * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, eyeY + r * 0.26, r * 0.08, 0, Math.PI);
    ctx.fillStyle = '#FF5252';
    ctx.fill();
  } else if (isBlinking) {
    // 2. 눈 감은 귀여운 표정 (u u)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = Math.max(2, r * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-eyeOffset, eyeY, eyeSize, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeOffset, eyeY, eyeSize, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // 살짝 미소
    ctx.beginPath();
    ctx.arc(0, eyeY + r * 0.14, r * 0.1, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    // 3. 평상시 초롱초롱 눈망울
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // 눈동자 하이라이트 (초롱초롱 별빛)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-eyeOffset - eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.45, 0, Math.PI * 2);
    ctx.arc(eyeOffset - eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.45, 0, Math.PI * 2);
    ctx.arc(-eyeOffset + eyeSize * 0.35, eyeY + eyeSize * 0.35, eyeSize * 0.2, 0, Math.PI * 2);
    ctx.arc(eyeOffset + eyeSize * 0.35, eyeY + eyeSize * 0.35, eyeSize * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 귀여운 입 (열린 미소)
    ctx.beginPath();
    ctx.arc(0, eyeY + r * 0.16, r * 0.12, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = Math.max(1.8, r * 0.045);
    ctx.lineCap = 'round';
    ctx.stroke();

    // 중대형 과일은 벌린 입 + 붉은 혀 표시
    if (fruitData.id >= 4) {
      ctx.beginPath();
      ctx.arc(0, eyeY + r * 0.16, r * 0.11, 0, Math.PI);
      ctx.fillStyle = '#FF5252';
      ctx.fill();
    }
  }
}

/**
 * 과일 꼭지 및 잎사귀
 */
function drawFruitTop(ctx, fruitData, r) {
  if (fruitData.id === 0) {
    // 체리 두 개 꼭지 연결 줄기
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.4, -r * 1.5, r * 0.7, -r * 1.7);
    ctx.stroke();
    // 작은 잎
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(r * 0.7, -r * 1.7, 5, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (fruitData.details === 'persimmon') {
    // 감의 4갈래 꽃받침 꼭지
    ctx.fillStyle = '#33691E';
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(0, -r * 0.9);
      ctx.rotate((i * Math.PI) / 2 + Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.15, r * 0.1, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(-r * 0.05, -r * 1.08, r * 0.1, r * 0.18);
  } else if (fruitData.details === 'pineapple') {
    // 파인애플 왕관 잎사귀들
    ctx.fillStyle = '#10AC84';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(i * r * 0.15, -r * 0.95);
      ctx.rotate((i * Math.PI) / 8);
      ctx.beginPath();
      ctx.moveTo(-r * 0.08, 0);
      ctx.quadraticCurveTo(0, -r * 0.4, 0, -r * 0.45);
      ctx.quadraticCurveTo(0, -r * 0.4, r * 0.08, 0);
      ctx.fill();
      ctx.restore();
    }
  } else if (fruitData.leafColor) {
    // 일반 꼭지와 잎사귀
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(-r * 0.05, -r * 1.1, r * 0.1, r * 0.18);

    ctx.fillStyle = fruitData.leafColor;
    ctx.beginPath();
    ctx.ellipse(r * 0.16, -r * 1.05, r * 0.16, r * 0.09, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
  }
}
