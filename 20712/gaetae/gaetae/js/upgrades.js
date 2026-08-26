/**
 * 네온 서바이벌 업그레이드 카드, 6레벨 초월 승급 & 카드 조합 시너지(Synergy Combo) 시스템
 */
class UpgradeManager {
  constructor(player, weaponSystem) {
    this.player = player;
    this.weaponSystem = weaponSystem;
    this.rerolls = 4; // 기본 새로고침 4회 제공

    // 패시브 스킬 정의 (1~5 일반 등급 / 6 초월 승급)
    this.initPassives();
    // 조합 시너지 정의
    this.initSynergies();
  }

  initPassives() {
    this.passives = {
      overdrive: {
        id: 'overdrive',
        type: 'passive',
        name: '오버드라이브 코어',
        evolvedName: '👑 타이탄 하이퍼 코어',
        icon: '💥',
        evolvedIcon: '💥👑',
        level: 0,
        maxLevel: 6,
        apply: (lvl) => {
          if (lvl < 6) {
            this.player.stats.damageMult += 0.12;
          } else {
            this.player.stats.damageMult += 1.0;
          }
        }
      },
      booster: {
        id: 'booster',
        type: 'passive',
        name: '부스터 제트',
        evolvedName: '👑 광속 워프 제트 엔진',
        icon: '👟',
        evolvedIcon: '👟👑',
        level: 0,
        maxLevel: 6,
        apply: (lvl) => {
          if (lvl < 6) {
            this.player.stats.speedMult += 0.10;
          } else {
            this.player.stats.speedMult += 0.70;
            this.player.dashCooldown *= 0.40;
          }
        }
      },
      nano_armor: {
        id: 'nano_armor',
        type: 'passive',
        name: '나노 티타늄 장갑',
        evolvedName: '👑 불멸의 이지스 쉴드',
        icon: '🛡️',
        evolvedIcon: '🛡️👑',
        level: 0,
        maxLevel: 6,
        apply: (lvl) => {
          if (lvl < 6) {
            this.player.stats.armor += 2;
            this.player.maxShield += 20;
            this.player.shield = this.player.maxShield;
          } else {
            this.player.stats.armor += 15;
            this.player.maxShield += 150;
            this.player.shield = this.player.maxShield;
          }
        }
      },
      magnet: {
        id: 'magnet',
        type: 'passive',
        name: '자기장 펄서',
        evolvedName: '👑 블랙홀 그래비티 펄스',
        icon: '🧲',
        evolvedIcon: '🧲👑',
        level: 0,
        maxLevel: 6,
        apply: (lvl) => {
          if (lvl < 6) {
            this.player.stats.magnetRadius *= 1.30;
          } else {
            this.player.stats.magnetRadius = 9999;
          }
        }
      },
      cyber_heart: {
        id: 'cyber_heart',
        type: 'passive',
        name: '사이버네틱 코어',
        evolvedName: '👑 이터널 피닉스 코어',
        icon: '❤️',
        evolvedIcon: '❤️👑',
        level: 0,
        maxLevel: 6,
        apply: (lvl) => {
          if (lvl < 6) {
            this.player.maxHp += 20;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
            this.player.stats.hpRegen += 1.2;
          } else {
            this.player.maxHp += 150;
            this.player.hp = this.player.maxHp;
            this.player.stats.hpRegen += 12.0;
          }
        }
      },
      hyper_clock: {
        id: 'hyper_clock',
        type: 'passive',
        name: '하이퍼 클럭',
        evolvedName: '👑 시간 왜곡 크로노스',
        icon: '⏱️',
        evolvedIcon: '⏱️👑',
        level: 0,
        maxLevel: 6,
        apply: (lvl) => {
          if (lvl < 6) {
            this.player.stats.cooldownMult *= 0.92;
          } else {
            this.player.stats.cooldownMult *= 0.50;
          }
        }
      },
      overclock: {
        id: 'overclock',
        type: 'passive',
        name: '정밀 오버클럭',
        evolvedName: '👑 신의 눈동자 오버클럭',
        icon: '🎯',
        evolvedIcon: '🎯👑',
        level: 0,
        maxLevel: 6,
        apply: (lvl) => {
          if (lvl < 6) {
            this.player.stats.critChance += 0.06;
            this.player.stats.critMult += 0.25;
          } else {
            this.player.stats.critChance += 0.40;
            this.player.stats.critMult += 1.50;
          }
        }
      }
    };
  }

  // 조합 시너지(Synergies) 정의
  initSynergies() {
    this.synergies = [
      {
        id: 'superconductor',
        name: '초전도 플라즈마 ⚡🔫',
        requires: ['blaster', 'lightning'],
        desc: '펄스 블래스터 탄환 적중 시 30% 확률로 연쇄 전기 스파크 유발 & 전체 공속 +25%',
        active: false,
        apply: () => {
          this.player.stats.damageMult += 0.25;
          this.player.stats.cooldownMult *= 0.80;
        }
      },
      {
        id: 'frost_nebula',
        name: '절대영도 성운 🔮❄️',
        requires: ['orbital', 'cryo'],
        desc: '오비탈 구체에 닿은 적 즉시 1.5초간 90% 동결 & 플레이어 방어력 +10',
        active: false,
        apply: () => {
          this.player.stats.armor += 10;
        }
      },
      {
        id: 'nuclear_overdrive',
        name: '핵폭발 오버드라이브 🚀💥',
        requires: ['missile', 'overdrive'],
        desc: '호밍 미사일 폭발 반경 +60% & 폭발 지점에 2차 충격파 발생',
        active: false,
        apply: () => {
          const m = this.weaponSystem.weapons.missile;
          if (m) m.explosionRadius *= 1.6;
          this.player.stats.damageMult += 0.35;
        }
      },
      {
        id: 'photon_accelerator',
        name: '광자 가속기 ✨⏱️',
        requires: ['laser_nova', 'hyper_clock'],
        desc: '레이저가 적을 밀쳐내며(넉백) 쿨다운 -25% 추가 감소',
        active: false,
        apply: () => {
          this.player.stats.cooldownMult *= 0.75;
        }
      },
      {
        id: 'nano_aegis',
        name: '나노 이지스 배리어 🔮🛡️',
        requires: ['orbital', 'nano_armor'],
        desc: '나노 쉴드 최대치 +120 & 피격 시 360도 반사 에너지 파동 방출',
        active: false,
        apply: () => {
          this.player.maxShield += 120;
          this.player.shield = this.player.maxShield;
          this.player.stats.armor += 8;
        }
      },
      {
        id: 'singularity_rockets',
        name: '블랙홀 유도탄 🚀🧲',
        requires: ['missile', 'magnet'],
        desc: '미사일 폭발 지점에 2초간 적을 빨아들이는 미니 블랙홀 생성',
        active: false,
        apply: () => {
          this.player.stats.magnetRadius *= 1.8;
        }
      },
      {
        id: 'critical_nova',
        name: '치명적 광선 ✨🎯',
        requires: ['laser_nova', 'overclock'],
        desc: '레이저 노바 공격이 100% 치명타로 적중 & 치명타 대미지 +80%',
        active: false,
        apply: () => {
          this.player.stats.critChance += 0.35;
          this.player.stats.critMult += 0.80;
        }
      },
      {
        id: 'phoenix_dynamo',
        name: '불사조 다이나모 ⚡❤️',
        requires: ['lightning', 'cyber_heart'],
        desc: '체인 라이트닝이 타격한 적 1명당 체력 1씩 즉시 흡혈 & 최대 HP +60',
        active: false,
        apply: () => {
          this.player.maxHp += 60;
          this.player.hp = this.player.maxHp;
          this.player.stats.hpRegen += 4.0;
        }
      }
    ];
  }

  // 조합 시너지 충족 여부 체크
  checkSynergies() {
    for (const syn of this.synergies) {
      if (syn.active) continue;

      const satisfied = syn.requires.every(reqId => {
        const weapon = this.weaponSystem.weapons[reqId];
        if (weapon && weapon.level > 0) return true;
        const passive = this.passives[reqId];
        if (passive && passive.level > 0) return true;
        return false;
      });

      if (satisfied) {
        syn.active = true;
        syn.apply();
        this.showSynergyUnlock(syn);
      }
    }
  }

  showSynergyUnlock(synergy) {
    window.soundManager.playLevelUp();
    window.particleSystem.triggerShake(12, 0.4);
    window.particleSystem.emitShockwave(this.player.x, this.player.y, 160, '#ffd700', 0.5);

    const banner = document.getElementById('warning-banner');
    if (banner) {
      banner.querySelector('.warning-text').innerText = `💥 [시너지 콤보 해금] ${synergy.name}!`;
      banner.classList.remove('hidden');
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 4000);
    }
  }

  getActiveSynergies() {
    return this.synergies.filter(s => s.active);
  }

  // 무기 설명 가져오기
  getWeaponDescription(id, nextLevel) {
    if (id === 'blaster') {
      if (nextLevel === 1) return '가장 가까운 적을 향해 고속 펄스 탄환을 자동 발사합니다.';
      if (nextLevel === 2) return '2발 동시 발사 & 쿨다운 소폭 감소';
      if (nextLevel === 3) return '3발 산탄 발사 & 관통력 +1';
      if (nextLevel === 4) return '4발 고속 연사 & 공격력 상승';
      if (nextLevel === 5) return '5발 산탄 연사 & 관통력 3';
      if (nextLevel >= 6) return '👑 [초월 승급]: 8발 전방위 개틀링 난사, 관통력 5, 쿨다운 0.12초 초고속 섬멸!';
    } else if (id === 'orbital') {
      if (nextLevel === 1) return '반경 130px 궤도로 회전하는 대형 플라즈마 보호막 구체 2개를 소환합니다.';
      if (nextLevel === 2) return '구체 3개로 증가, 반경 150px 확장 & 대미지 증가';
      if (nextLevel === 3) return '구체 4개, 반경 175px 확장 & 회전 속도 상승';
      if (nextLevel === 4) return '구체 5개, 반경 200px 확장 & 구체 크기 확대';
      if (nextLevel === 5) return '구체 6개, 반경 225px 확장 & 철벽의 보호막';
      if (nextLevel >= 6) return '👑 [초월 승급]: 2중 궤도(150px/240px) 12개의 거대 초신성 성운 구체, 무적의 절대 배리어!';
    } else if (id === 'lightning') {
      if (nextLevel === 1) return '주변 적 3명에게 연쇄 번개를 내리칩니다.';
      if (nextLevel === 2) return '연쇄 대상 4명으로 증가 & 쿨다운 감소';
      if (nextLevel === 3) return '연쇄 대상 5명 & 공격력 상승';
      if (nextLevel === 4) return '연쇄 대상 7명 & 쿨다운 단축';
      if (nextLevel === 5) return '연쇄 대상 9명 & 강력한 고전압 감전';
      if (nextLevel >= 6) return '👑 [초월 승급]: 전 화면 25명에게 벼락 폭풍 연쇄 강타, 쿨다운 0.55초 초고속 낙뢰!';
    } else if (id === 'missile') {
      if (nextLevel === 1) return '적을 자동 추적하는 호밍 마이크로 미사일을 발사합니다.';
      if (nextLevel === 2) return '미사일 2발 발사, 폭발 반경 및 피해량 증가';
      if (nextLevel === 3) return '미사일 3발 발사 & 쿨다운 감소';
      if (nextLevel === 4) return '미사일 4발 일제 사격 & 폭발 범위 확장';
      if (nextLevel === 5) return '미사일 5발 연사 & 공격력 대폭 상승';
      if (nextLevel >= 6) return '👑 [초월 승급]: 8발의 대구경 유도 핵미사일 일제 폭격, 폭발 반경 180px 초토화!';
    } else if (id === 'laser_nova') {
      if (nextLevel === 1) return '플레이어 코어에서 2방향 관통 레이저 빔을 방출합니다. (눈에 편안한 부드러운 인디고 컬러)';
      if (nextLevel === 2) return '4방향 십자(Cross) 레이저 빔으로 업그레이드';
      if (nextLevel === 3) return '6방향 방사 레이저 & 광선 폭/대미지 상승';
      if (nextLevel === 4) return '8방향 전방위 레이저 폭격';
      if (nextLevel === 5) return '10방향 레이저 & 쿨다운 단축';
      if (nextLevel >= 6) return '👑 [초월 승급]: 16방향 360도 전방위 초거대 광자 레이저, 화면 전체 완전 증발!';
    } else if (id === 'cryo') {
      if (nextLevel === 1) return '반경 130px 적들을 40% 감속시키고 지속 냉기 피해를 주는 빙결 필드를 전개합니다.';
      if (nextLevel === 2) return '필드 반경 160px 확장 & 둔화율 50%로 강화';
      if (nextLevel === 3) return '필드 반경 195px 확장 & 지속 대미지 상승';
      if (nextLevel === 4) return '필드 반경 230px 확장 & 둔화율 70%';
      if (nextLevel === 5) return '필드 반경 270px 확장 & 둔화율 80%';
      if (nextLevel >= 6) return '👑 [초월 승급]: 반경 360px 초대형 빙하기 필드, 적 95% 이동 봉쇄 완전 동결!';
    }
    return '';
  }

  // 패시브 설명 가져오기
  getPassiveDescription(id, nextLevel) {
    if (id === 'overdrive') {
      if (nextLevel < 6) return `모든 무기의 공격력이 +12% 증가합니다. (현재: LV.${nextLevel - 1})`;
      return '👑 [초월 각성]: 모든 무기 공격력 +100% 대폭 증폭, 궁극의 파괴력 발현!';
    } else if (id === 'booster') {
      if (nextLevel < 6) return `이동 속도가 +10% 증가합니다. (현재: LV.${nextLevel - 1})`;
      return '👑 [초월 각성]: 이동속도 +70% 폭발적 증가 & 대시 쿨다운 60% 대폭 단축!';
    } else if (id === 'nano_armor') {
      if (nextLevel < 6) return `받는 피해가 고정 2 감소하고 쉴드 20을 생성합니다. (현재: LV.${nextLevel - 1})`;
      return '👑 [초월 각성]: 방어력 +15 & 불멸의 나노 쉴드 150 즉시 생성!';
    } else if (id === 'magnet') {
      if (nextLevel < 6) return `에너지 젬 흡입 반경이 +30% 확장됩니다. (현재: LV.${nextLevel - 1})`;
      return '👑 [초월 각성]: 맵 전체 모든 에너지 젬을 상시 무한 자동 흡입하는 블랙홀 발동!';
    } else if (id === 'cyber_heart') {
      if (nextLevel < 6) return `최대 HP가 +20 증가하고 초당 체력 재생이 +1.2 추가됩니다. (현재: LV.${nextLevel - 1})`;
      return '👑 [초월 각성]: 최대 HP +150 증가, 체력 완전 회복 & 초당 체력 재생 +12!';
    } else if (id === 'hyper_clock') {
      if (nextLevel < 6) return `모든 무기 및 대시 쿨다운이 -8% 단축됩니다. (현재: LV.${nextLevel - 1})`;
      return '👑 [초월 각성]: 모든 무기 및 스킬 재사용 대기시간 50% 추가 단축, 무한 연사!';
    } else if (id === 'overclock') {
      if (nextLevel < 6) return `치명타 확률 +6% & 치명타 대미지 +25% 상승. (현재: LV.${nextLevel - 1})`;
      return '👑 [초월 각성]: 치명타 확률 +40% & 치명타 피해량 +150% 신의 일격!';
    }
    return '';
  }

  // 레벨업 시 제공할 3개 카드 무작위 추첨
  getRandomChoices(count = 3) {
    const available = [];

    // 1. 무기 후보 수집
    for (const key in this.weaponSystem.weapons) {
      const w = this.weaponSystem.weapons[key];
      if (w.level < w.maxLevel) {
        const nextLvl = w.level + 1;
        const isEvolution = nextLvl === 6;
        available.push({
          type: 'weapon',
          id: w.id,
          name: isEvolution ? w.evolvedName : w.name,
          icon: isEvolution ? w.evolvedIcon : w.icon,
          currentLevel: w.level,
          nextLevel: nextLvl,
          isEvolution: isEvolution,
          desc: this.getWeaponDescription(w.id, nextLvl)
        });
      }
    }

    // 2. 패시브 후보 수집
    for (const key in this.passives) {
      const p = this.passives[key];
      if (p.level < p.maxLevel) {
        const nextLvl = p.level + 1;
        const isEvolution = nextLvl === 6;
        available.push({
          type: 'passive',
          id: p.id,
          name: isEvolution ? p.evolvedName : p.name,
          icon: isEvolution ? p.evolvedIcon : p.icon,
          currentLevel: p.level,
          nextLevel: nextLvl,
          isEvolution: isEvolution,
          desc: this.getPassiveDescription(p.id, nextLvl)
        });
      }
    }

    available.sort((a, b) => {
      if (a.isEvolution && !b.isEvolution) return -1;
      if (!a.isEvolution && b.isEvolution) return 1;
      return 0.5 - Math.random();
    });

    return available.slice(0, count);
  }

  // 카드 선택 적용
  selectUpgrade(choice) {
    if (choice.type === 'weapon') {
      this.weaponSystem.upgradeWeapon(choice.id);
    } else if (choice.type === 'passive') {
      const p = this.passives[choice.id];
      p.level++;
      if (p.level >= 6) {
        p.name = p.evolvedName;
        p.icon = p.evolvedIcon;
      }
      p.apply(p.level);
    }

    // 조합 시너지 해금 검사
    this.checkSynergies();
  }

  // 인벤토리 목록 (HUD 표시용)
  getActiveList() {
    const list = [];
    for (const key in this.weaponSystem.weapons) {
      const w = this.weaponSystem.weapons[key];
      if (w.level > 0) {
        list.push({ 
          icon: w.level >= 6 ? w.evolvedIcon : w.icon, 
          level: w.level >= 6 ? 'MAX' : w.level, 
          isEvolved: w.level >= 6,
          name: w.level >= 6 ? w.evolvedName : w.name, 
          color: w.level >= 6 ? '#ffff00' : w.color 
        });
      }
    }
    for (const key in this.passives) {
      const p = this.passives[key];
      if (p.level > 0) {
        list.push({ 
          icon: p.level >= 6 ? p.evolvedIcon : p.icon, 
          level: p.level >= 6 ? 'MAX' : p.level, 
          isEvolved: p.level >= 6,
          name: p.level >= 6 ? p.evolvedName : p.name, 
          color: p.level >= 6 ? '#ff00ff' : '#b026ff' 
        });
      }
    }
    return list;
  }

  reset() {
    this.rerolls = 4;
    this.initPassives();
    this.initSynergies();
  }
}

window.UpgradeManager = UpgradeManager;
