import re

with open('src/components/ArenaCanvas.tsx', 'r') as f:
    text = f.read()

# ─────────────────────────────────────────────────────────────
# 1. P1 COMBAT REPLACEMENT
# ─────────────────────────────────────────────────────────────
p1_old = '''            p1.isSliding = true;
            p1.slideTicks = 18;
            p1.attackCooldown = 28;
            p1.velocityX = p1FacingDir * 430;
            s.p1Controller.vx = p1.velocityX;
            sounds.playSlide();
            PlayerFSM.tryTransition(p1, PlayerFSMState.CrouchSlide);
            addSparks(p1.x, p1.y + 16, '#94a3b8', 12);

            const slideHit = CombatSystem.resolveSlideTackle(p1, bot);
            if (slideHit.didHit) {
              sounds.playHit();
              s.screenShake = 8;
              addSparks(bot.x, bot.y + 12, '#38bdf8', 16);
              s.floatingTexts.push({
                id: s.nextEntityId++,
                text: `¡BARRIDA! -${Math.round(slideHit.damageDealt)}`,
                x: bot.x,
                y: bot.y - 25,
                color: '#38bdf8',
                life: 35,
              });
            }'''

p1_new = '''            const isBladeP1 = isBladeWeapon(p1.equippedWeapon);
            p1.isSliding = true;
            p1.slideTicks = 18;
            p1.attackCooldown = isBladeP1 ? 24 : 28;
            p1.velocityX = p1FacingDir * (isBladeP1 ? 460 : 430);
            s.p1Controller.vx = p1.velocityX;
            if (isBladeP1) {
              sounds.playSwordSwing();
              sounds.playSlide();
            } else {
              sounds.playSlide();
            }
            PlayerFSM.tryTransition(p1, PlayerFSMState.CrouchSlide);
            addSparks(p1.x, p1.y + 16, isBladeP1 ? '#e0f2fe' : '#94a3b8', 14);

            if (isBladeP1) {
              const slideHit = CombatSystem.resolveBladeDashSlash(p1, bot);
              if (slideHit.didHit) {
                sounds.playBladeHit();
                s.screenShake = 9;
                addSparks(bot.x, bot.y + 12, '#38bdf8', 18);
                addSparks(bot.x, bot.y + 12, '#ffffff', 12);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡TAJO RASANTE! -${Math.round(slideHit.damageDealt)}`,
                  x: bot.x,
                  y: bot.y - 25,
                  color: '#38bdf8',
                  life: 35,
                });
              }
            } else {
              const slideHit = CombatSystem.resolveSlideTackle(p1, bot);
              if (slideHit.didHit) {
                sounds.playHit();
                s.screenShake = 8;
                addSparks(bot.x, bot.y + 12, '#38bdf8', 16);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡BARRIDA! -${Math.round(slideHit.damageDealt)}`,
                  x: bot.x,
                  y: bot.y - 25,
                  color: '#38bdf8',
                  life: 35,
                });
              }
            }'''

assert p1_old in text, "p1_old not found"
text = text.replace(p1_old, p1_new, 1)

# P1 Heavy Smash & Normal Combo
p1_smash_old = '''            if (charge >= 12) {
              const chargeRatio = Math.min(1, charge / 36);
              sounds.playHeavySmash();
              p1.attackCooldown = 32;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              p1.velocityX = p1FacingDir * (180 + 120 * chargeRatio);
              s.p1Controller.vx = p1.velocityX;
              s.screenShake = 12 + Math.round(chargeRatio * 8);

              const smashHit = CombatSystem.resolveHeavySmash(p1, bot, chargeRatio);
              if (smashHit.didHit) {
                sounds.playHit();
                addSparks(bot.x, bot.y, '#f59e0b', 24);
                addSparks(bot.x, bot.y, '#ef4444', 16);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: chargeRatio > 0.75
                    ? `¡SMASH CRÍTICO! -${Math.round(smashHit.damageDealt)}`
                    : `¡HEAVY SMASH! -${Math.round(smashHit.damageDealt)}`,
                  x: bot.x,
                  y: bot.y - 35,
                  color: '#f59e0b',
                  life: 45,
                });
              }

              s.crates.forEach((c) => {
                if (Math.hypot(p1.x - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 55) {
                  c.health -= 25;
                  c.vx = p1FacingDir * 460;
                  sounds.playCrateBreak();
                  addSparks(c.x + 16, c.y + 16, '#d97706', 14);
                }
              });
              s.barrels.forEach((b) => {
                if (Math.hypot(p1.x - (b.x + b.w / 2), b.y - (b.y + b.h / 2)) < 55) {
                  b.health -= 20;
                  b.vx = p1FacingDir * 520;
                  sounds.playHit();
                  addSparks(b.x + 12, b.y + 16, '#ef4444', 14);
                }
              });
            } else {
              p1.comboStep = (p1.comboStep + 1) % 3;
              p1.comboWindowTicks = GameConstants.FistsComboWindowTicks;
              p1.attackCooldown = GameConstants.FistsCooldownTicks;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);
              sounds.playPunch();

              const hit = CombatSystem.resolveMelee(p1, bot);
              if (hit.didHit) {
                sounds.playHit();
                addSparks(bot.x, bot.y, '#38bdf8', 12);
                s.screenShake = p1.comboStep === 2 ? 8 : 5;
                const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `${comboNames[p1.comboStep]} -${Math.round(hit.damageDealt)}`,
                  x: bot.x,
                  y: bot.y - 25,
                  color: '#38bdf8',
                  life: 35,
                });
              }
            }'''

p1_smash_new = '''            const isBladeP1 = isBladeWeapon(p1.equippedWeapon);
            if (charge >= 12) {
              const chargeRatio = Math.min(1, charge / 36);
              if (isBladeP1) {
                sounds.playHeavyBladeSlash();
                p1.attackCooldown = 30;
              } else {
                sounds.playHeavySmash();
                p1.attackCooldown = 32;
              }
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              p1.velocityX = p1FacingDir * (isBladeP1 ? (220 + 150 * chargeRatio) : (180 + 120 * chargeRatio));
              s.p1Controller.vx = p1.velocityX;
              s.screenShake = 12 + Math.round(chargeRatio * 8);

              if (isBladeP1) {
                const slashHit = CombatSystem.resolveBladeHeavySlash(p1, bot, chargeRatio);
                if (slashHit.didHit) {
                  sounds.playBladeHit();
                  addSparks(bot.x, bot.y, '#e0f2fe', 26);
                  addSparks(bot.x, bot.y, '#ef4444', 18);
                  addSparks(bot.x, bot.y, '#38bdf8', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: chargeRatio > 0.75
                      ? `¡TAJO DEMOLEDOR CRÍTICO! -${Math.round(slashHit.damageDealt)}`
                      : `¡TAJO CON FILO! -${Math.round(slashHit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 35,
                    color: '#38bdf8',
                    life: 45,
                  });
                }
              } else {
                const smashHit = CombatSystem.resolveHeavySmash(p1, bot, chargeRatio);
                if (smashHit.didHit) {
                  sounds.playHit();
                  addSparks(bot.x, bot.y, '#f59e0b', 24);
                  addSparks(bot.x, bot.y, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: chargeRatio > 0.75
                      ? `¡SMASH CRÍTICO! -${Math.round(smashHit.damageDealt)}`
                      : `¡HEAVY SMASH! -${Math.round(smashHit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 35,
                    color: '#f59e0b',
                    life: 45,
                  });
                }
              }

              s.crates.forEach((c) => {
                if (Math.hypot(p1.x - (c.x + c.w / 2), p1.y - (c.y + c.h / 2)) < 55) {
                  c.health -= isBladeP1 ? 30 : 25;
                  c.vx = p1FacingDir * 460;
                  sounds.playCrateBreak();
                  addSparks(c.x + 16, c.y + 16, '#d97706', 14);
                }
              });
              s.barrels.forEach((b) => {
                if (Math.hypot(p1.x - (b.x + b.w / 2), b.y - (b.y + b.h / 2)) < 55) {
                  b.health -= 20;
                  b.vx = p1FacingDir * 520;
                  sounds.playHit();
                  addSparks(b.x + 12, b.y + 16, '#ef4444', 14);
                }
              });
            } else {
              p1.comboStep = (p1.comboStep + 1) % 3;
              p1.comboWindowTicks = isBladeP1 ? 34 : GameConstants.FistsComboWindowTicks;
              p1.attackCooldown = isBladeP1 ? 14 : GameConstants.FistsCooldownTicks;
              PlayerFSM.tryTransition(p1, PlayerFSMState.MeleeAttack);

              if (isBladeP1) {
                sounds.playSwordSwing();
                const hit = CombatSystem.resolveBladeMelee(p1, bot);
                if (hit.didHit) {
                  sounds.playBladeHit();
                  addSparks(bot.x, bot.y, '#e0f2fe', 18);
                  addSparks(bot.x, bot.y, '#ef4444', 14);
                  s.screenShake = p1.comboStep === 2 ? 9 : 5;
                  const bladeComboNames = ['¡TAJO HORIZONTAL!', '¡CLEAVE DESCENDENTE!', '¡CORTE FINAL!'];
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `${bladeComboNames[p1.comboStep]} -${Math.round(hit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 25,
                    color: '#38bdf8',
                    life: 35,
                  });
                }
              } else {
                sounds.playPunch();
                const hit = CombatSystem.resolveMelee(p1, bot);
                if (hit.didHit) {
                  sounds.playHit();
                  addSparks(bot.x, bot.y, '#38bdf8', 12);
                  s.screenShake = p1.comboStep === 2 ? 8 : 5;
                  const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `${comboNames[p1.comboStep]} -${Math.round(hit.damageDealt)}`,
                    x: bot.x,
                    y: bot.y - 25,
                    color: '#38bdf8',
                    life: 35,
                  });
                }
              }
            }'''

assert p1_smash_old in text, "p1_smash_old not found"
text = text.replace(p1_smash_old, p1_smash_new, 1)

# ─────────────────────────────────────────────────────────────
# 2. J2 COMBAT REPLACEMENT (Local 1v1)
# ─────────────────────────────────────────────────────────────
j2_slide_old = '''            } else if (
              j2MeleeJustPressed &&
              bot.attackCooldown <= 0 &&
              (crouchHeld || s.p2Controller.state === ControllerState.Roll || Math.abs(bot.velocityX) > 130) &&
              bot.onGround
            ) {
              bot.isSliding = true;
              bot.slideTicks = 18;
              bot.attackCooldown = 28;
              bot.velocityX = p2FacingDir * 430;
              s.p2Controller.vx = bot.velocityX;
              sounds.playSlide();
              PlayerFSM.tryTransition(bot, PlayerFSMState.CrouchSlide);
              addSparks(bot.x, bot.y + 16, '#94a3b8', 12);

              const slideHit = CombatSystem.resolveSlideTackle(bot, p1);
              if (slideHit.didHit) {
                sounds.playHit();
                s.screenShake = 8;
                addSparks(p1.x, p1.y + 12, '#ef4444', 16);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡BARRIDA J2! -${Math.round(slideHit.damageDealt)}`,
                  x: p1.x,
                  y: p1.y - 25,
                  color: '#ef4444',
                  life: 35,
                });
              }'''

j2_slide_new = '''            } else if (
              j2MeleeJustPressed &&
              bot.attackCooldown <= 0 &&
              (crouchHeld || s.p2Controller.state === ControllerState.Roll || Math.abs(bot.velocityX) > 130) &&
              bot.onGround
            ) {
              const isBladeJ2 = isBladeWeapon(bot.equippedWeapon);
              bot.isSliding = true;
              bot.slideTicks = 18;
              bot.attackCooldown = isBladeJ2 ? 24 : 28;
              bot.velocityX = p2FacingDir * (isBladeJ2 ? 460 : 430);
              s.p2Controller.vx = bot.velocityX;
              if (isBladeJ2) {
                sounds.playSwordSwing();
                sounds.playSlide();
              } else {
                sounds.playSlide();
              }
              PlayerFSM.tryTransition(bot, PlayerFSMState.CrouchSlide);
              addSparks(bot.x, bot.y + 16, isBladeJ2 ? '#e0f2fe' : '#94a3b8', 14);

              if (isBladeJ2) {
                const slideHit = CombatSystem.resolveBladeDashSlash(bot, p1);
                if (slideHit.didHit) {
                  sounds.playBladeHit();
                  s.screenShake = 9;
                  addSparks(p1.x, p1.y + 12, '#ef4444', 18);
                  addSparks(p1.x, p1.y + 12, '#ffffff', 12);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡TAJO RASANTE J2! -${Math.round(slideHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#ef4444',
                    life: 35,
                  });
                }
              } else {
                const slideHit = CombatSystem.resolveSlideTackle(bot, p1);
                if (slideHit.didHit) {
                  sounds.playHit();
                  s.screenShake = 8;
                  addSparks(p1.x, p1.y + 12, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡BARRIDA J2! -${Math.round(slideHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#ef4444',
                    life: 35,
                  });
                }
              }'''

assert j2_slide_old in text, "j2_slide_old not found"
text = text.replace(j2_slide_old, j2_slide_new, 1)

# J2 Heavy & Normal Combo
j2_smash_old = '''              if (charge >= 12) {
                const chargeRatio = Math.min(1, charge / 36);
                sounds.playHeavySmash();
                bot.attackCooldown = 32;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                bot.velocityX = p2FacingDir * (180 + 120 * chargeRatio);
                s.p2Controller.vx = bot.velocityX;
                s.screenShake = 12 + Math.round(chargeRatio * 8);

                const smashHit = CombatSystem.resolveHeavySmash(bot, p1, chargeRatio);
                if (smashHit.didHit) {
                  sounds.playHit();
                  addSparks(p1.x, p1.y, '#f59e0b', 24);
                  addSparks(p1.x, p1.y, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: chargeRatio > 0.75
                      ? `¡SMASH CRÍTICO J2! -${Math.round(smashHit.damageDealt)}`
                      : `¡HEAVY SMASH J2! -${Math.round(smashHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 35,
                    color: '#f59e0b',
                    life: 45,
                  });
                }

                s.crates.forEach((c) => {
                  if (Math.hypot(bot.x - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 55) {
                    c.health -= 25;
                    c.vx = p2FacingDir * 460;
                    sounds.playCrateBreak();
                    addSparks(c.x + 16, c.y + 16, '#d97706', 14);
                  }
                });
                s.barrels.forEach((b) => {
                  if (Math.hypot(bot.x - (b.x + b.w / 2), b.y - (b.y + b.h / 2)) < 55) {
                    b.health -= 20;
                    b.vx = p2FacingDir * 520;
                    sounds.playHit();
                    addSparks(b.x + 12, b.y + 16, '#ef4444', 14);
                  }
                });
              } else {
                bot.comboStep = (bot.comboStep + 1) % 3;
                bot.comboWindowTicks = GameConstants.FistsComboWindowTicks;
                bot.attackCooldown = GameConstants.FistsCooldownTicks;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);
                sounds.playPunch();

                if (s.p1Controller.isInvulnerable) {
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: '¡ESQUIVADO!',
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#38bdf8',
                    life: 25,
                  });
                } else {
                  const hit = CombatSystem.resolveMelee(bot, p1);
                  if (hit.didHit) {
                    sounds.playHit();
                    addSparks(p1.x, p1.y, '#ef4444', 12);
                    s.screenShake = bot.comboStep === 2 ? 8 : 5;
                    const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: `${comboNames[bot.comboStep]} -${Math.round(hit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 25,
                      color: '#ef4444',
                      life: 35,
                    });
                  }
                }'''

j2_smash_new = '''              const isBladeJ2 = isBladeWeapon(bot.equippedWeapon);
              if (charge >= 12) {
                const chargeRatio = Math.min(1, charge / 36);
                if (isBladeJ2) {
                  sounds.playHeavyBladeSlash();
                  bot.attackCooldown = 30;
                } else {
                  sounds.playHeavySmash();
                  bot.attackCooldown = 32;
                }
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                bot.velocityX = p2FacingDir * (isBladeJ2 ? (220 + 150 * chargeRatio) : (180 + 120 * chargeRatio));
                s.p2Controller.vx = bot.velocityX;
                s.screenShake = 12 + Math.round(chargeRatio * 8);

                if (isBladeJ2) {
                  const slashHit = CombatSystem.resolveBladeHeavySlash(bot, p1, chargeRatio);
                  if (slashHit.didHit) {
                    sounds.playBladeHit();
                    addSparks(p1.x, p1.y, '#e0f2fe', 26);
                    addSparks(p1.x, p1.y, '#ef4444', 20);
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: chargeRatio > 0.75
                        ? `¡TAJO DEMOLEDOR CRÍTICO J2! -${Math.round(slashHit.damageDealt)}`
                        : `¡TAJO CON FILO J2! -${Math.round(slashHit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 35,
                      color: '#ef4444',
                      life: 45,
                    });
                  }
                } else {
                  const smashHit = CombatSystem.resolveHeavySmash(bot, p1, chargeRatio);
                  if (smashHit.didHit) {
                    sounds.playHit();
                    addSparks(p1.x, p1.y, '#f59e0b', 24);
                    addSparks(p1.x, p1.y, '#ef4444', 16);
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: chargeRatio > 0.75
                        ? `¡SMASH CRÍTICO J2! -${Math.round(smashHit.damageDealt)}`
                        : `¡HEAVY SMASH J2! -${Math.round(smashHit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 35,
                      color: '#f59e0b',
                      life: 45,
                    });
                  }
                }

                s.crates.forEach((c) => {
                  if (Math.hypot(bot.x - (c.x + c.w / 2), bot.y - (c.y + c.h / 2)) < 55) {
                    c.health -= isBladeJ2 ? 30 : 25;
                    c.vx = p2FacingDir * 460;
                    sounds.playCrateBreak();
                    addSparks(c.x + 16, c.y + 16, '#d97706', 14);
                  }
                });
                s.barrels.forEach((b) => {
                  if (Math.hypot(bot.x - (b.x + b.w / 2), b.y - (b.y + b.h / 2)) < 55) {
                    b.health -= 20;
                    b.vx = p2FacingDir * 520;
                    sounds.playHit();
                    addSparks(b.x + 12, b.y + 16, '#ef4444', 14);
                  }
                });
              } else {
                bot.comboStep = (bot.comboStep + 1) % 3;
                bot.comboWindowTicks = isBladeJ2 ? 34 : GameConstants.FistsComboWindowTicks;
                bot.attackCooldown = isBladeJ2 ? 14 : GameConstants.FistsCooldownTicks;
                PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

                if (isBladeJ2) {
                  sounds.playSwordSwing();
                  if (s.p1Controller.isInvulnerable) {
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: '¡ESQUIVADO!',
                      x: p1.x,
                      y: p1.y - 25,
                      color: '#38bdf8',
                      life: 25,
                    });
                  } else {
                    const hit = CombatSystem.resolveBladeMelee(bot, p1);
                    if (hit.didHit) {
                      sounds.playBladeHit();
                      addSparks(p1.x, p1.y, '#e0f2fe', 18);
                      addSparks(p1.x, p1.y, '#ef4444', 14);
                      s.screenShake = bot.comboStep === 2 ? 9 : 5;
                      const bladeComboNames = ['¡TAJO HORIZONTAL!', '¡CLEAVE DESCENDENTE!', '¡CORTE FINAL!'];
                      s.floatingTexts.push({
                        id: s.nextEntityId++,
                        text: `${bladeComboNames[bot.comboStep]} J2 -${Math.round(hit.damageDealt)}`,
                        x: p1.x,
                        y: p1.y - 25,
                        color: '#ef4444',
                        life: 35,
                      });
                    }
                  }
                } else {
                  sounds.playPunch();
                  if (s.p1Controller.isInvulnerable) {
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: '¡ESQUIVADO!',
                      x: p1.x,
                      y: p1.y - 25,
                      color: '#38bdf8',
                      life: 25,
                    });
                  } else {
                    const hit = CombatSystem.resolveMelee(bot, p1);
                    if (hit.didHit) {
                      sounds.playHit();
                      addSparks(p1.x, p1.y, '#ef4444', 12);
                      s.screenShake = bot.comboStep === 2 ? 8 : 5;
                      const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                      s.floatingTexts.push({
                        id: s.nextEntityId++,
                        text: `${comboNames[bot.comboStep]} -${Math.round(hit.damageDealt)}`,
                        x: p1.x,
                        y: p1.y - 25,
                        color: '#ef4444',
                        life: 35,
                      });
                    }
                  }
                }'''

assert j2_smash_old in text, "j2_smash_old not found"
text = text.replace(j2_smash_old, j2_smash_new, 1)

# ─────────────────────────────────────────────────────────────
# 3. BOT AI COMBAT REPLACEMENT (vsBot)
# ─────────────────────────────────────────────────────────────
bot_ai_old = '''            } else if (canSlide && Math.random() < 0.35) {
              bot.isSliding = true;
              bot.slideTicks = 18;
              bot.attackCooldown = 30;
              bot.velocityX = botFacingDir * 430;
              s.p2Controller.vx = bot.velocityX;
              sounds.playSlide();
              PlayerFSM.tryTransition(bot, PlayerFSMState.CrouchSlide);
              addSparks(bot.x, bot.y + 16, '#94a3b8', 12);

              const slideHit = CombatSystem.resolveSlideTackle(bot, p1);
              if (slideHit.didHit) {
                sounds.playHit();
                s.screenShake = 8;
                addSparks(p1.x, p1.y + 12, '#ef4444', 16);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡BARRIDA BOT! -${Math.round(slideHit.damageDealt)}`,
                  x: p1.x,
                  y: p1.y - 25,
                  color: '#ef4444',
                  life: 35,
                });
              }
            } else if (canHeavySmash && Math.random() < 0.5) {
              const chargeRatio = 0.85;
              sounds.playHeavySmash();
              bot.attackCooldown = 36;
              PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

              bot.velocityX = botFacingDir * 240;
              s.p2Controller.vx = bot.velocityX;
              s.screenShake = 14;

              const smashHit = CombatSystem.resolveHeavySmash(bot, p1, chargeRatio);
              if (smashHit.didHit) {
                sounds.playHit();
                addSparks(p1.x, p1.y, '#f59e0b', 24);
                addSparks(p1.x, p1.y, '#ef4444', 16);
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: `¡HEAVY SMASH BOT! -${Math.round(smashHit.damageDealt)}`,
                  x: p1.x,
                  y: p1.y - 35,
                  color: '#f59e0b',
                  life: 45,
                });
              }
            } else {
              bot.comboStep = (bot.comboStep + 1) % 3;
              bot.comboWindowTicks = GameConstants.FistsComboWindowTicks;
              bot.attackCooldown = GameConstants.FistsCooldownTicks;
              PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);
              sounds.playPunch();

              if (s.p1Controller.isInvulnerable) {
                s.floatingTexts.push({
                  id: s.nextEntityId++,
                  text: '¡ESQUIVADO!',
                  x: p1.x,
                  y: p1.y - 25,
                  color: '#38bdf8',
                  life: 25,
                });
              } else {
                const hit = CombatSystem.resolveMelee(bot, p1);
                if (hit.didHit) {
                  sounds.playHit();
                  addSparks(p1.x, p1.y, '#ef4444', 12);
                  s.screenShake = bot.comboStep === 2 ? 8 : 5;
                  const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `${comboNames[bot.comboStep]} -${Math.round(hit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#ef4444',
                    life: 35,
                  });
                }
              }'''

bot_ai_new = '''            } else if (canSlide && Math.random() < 0.35) {
              const isBladeBot = isBladeWeapon(bot.equippedWeapon);
              bot.isSliding = true;
              bot.slideTicks = 18;
              bot.attackCooldown = isBladeBot ? 25 : 30;
              bot.velocityX = botFacingDir * (isBladeBot ? 460 : 430);
              s.p2Controller.vx = bot.velocityX;
              if (isBladeBot) {
                sounds.playSwordSwing();
                sounds.playSlide();
              } else {
                sounds.playSlide();
              }
              PlayerFSM.tryTransition(bot, PlayerFSMState.CrouchSlide);
              addSparks(bot.x, bot.y + 16, isBladeBot ? '#e0f2fe' : '#94a3b8', 14);

              if (isBladeBot) {
                const slideHit = CombatSystem.resolveBladeDashSlash(bot, p1);
                if (slideHit.didHit) {
                  sounds.playBladeHit();
                  s.screenShake = 9;
                  addSparks(p1.x, p1.y + 12, '#ef4444', 18);
                  addSparks(p1.x, p1.y + 12, '#ffffff', 12);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡TAJO RASANTE BOT! -${Math.round(slideHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#ef4444',
                    life: 35,
                  });
                }
              } else {
                const slideHit = CombatSystem.resolveSlideTackle(bot, p1);
                if (slideHit.didHit) {
                  sounds.playHit();
                  s.screenShake = 8;
                  addSparks(p1.x, p1.y + 12, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡BARRIDA BOT! -${Math.round(slideHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#ef4444',
                    life: 35,
                  });
                }
              }
            } else if (canHeavySmash && Math.random() < 0.5) {
              const isBladeBot = isBladeWeapon(bot.equippedWeapon);
              const chargeRatio = 0.85;
              if (isBladeBot) {
                sounds.playHeavyBladeSlash();
                bot.attackCooldown = 32;
              } else {
                sounds.playHeavySmash();
                bot.attackCooldown = 36;
              }
              PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

              bot.velocityX = botFacingDir * (isBladeBot ? 280 : 240);
              s.p2Controller.vx = bot.velocityX;
              s.screenShake = 14;

              if (isBladeBot) {
                const smashHit = CombatSystem.resolveBladeHeavySlash(bot, p1, chargeRatio);
                if (smashHit.didHit) {
                  sounds.playBladeHit();
                  addSparks(p1.x, p1.y, '#e0f2fe', 26);
                  addSparks(p1.x, p1.y, '#ef4444', 18);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡TAJO DEMOLEDOR BOT! -${Math.round(smashHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 35,
                    color: '#ef4444',
                    life: 45,
                  });
                }
              } else {
                const smashHit = CombatSystem.resolveHeavySmash(bot, p1, chargeRatio);
                if (smashHit.didHit) {
                  sounds.playHit();
                  addSparks(p1.x, p1.y, '#f59e0b', 24);
                  addSparks(p1.x, p1.y, '#ef4444', 16);
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: `¡HEAVY SMASH BOT! -${Math.round(smashHit.damageDealt)}`,
                    x: p1.x,
                    y: p1.y - 35,
                    color: '#f59e0b',
                    life: 45,
                  });
                }
              }
            } else {
              const isBladeBot = isBladeWeapon(bot.equippedWeapon);
              bot.comboStep = (bot.comboStep + 1) % 3;
              bot.comboWindowTicks = isBladeBot ? 34 : GameConstants.FistsComboWindowTicks;
              bot.attackCooldown = isBladeBot ? 14 : GameConstants.FistsCooldownTicks;
              PlayerFSM.tryTransition(bot, PlayerFSMState.MeleeAttack);

              if (isBladeBot) {
                sounds.playSwordSwing();
                if (s.p1Controller.isInvulnerable) {
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: '¡ESQUIVADO!',
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#38bdf8',
                    life: 25,
                  });
                } else {
                  const hit = CombatSystem.resolveBladeMelee(bot, p1);
                  if (hit.didHit) {
                    sounds.playBladeHit();
                    addSparks(p1.x, p1.y, '#e0f2fe', 18);
                    addSparks(p1.x, p1.y, '#ef4444', 14);
                    s.screenShake = bot.comboStep === 2 ? 9 : 5;
                    const bladeComboNames = ['¡TAJO HORIZONTAL!', '¡CLEAVE DESCENDENTE!', '¡CORTE FINAL!'];
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: `${bladeComboNames[bot.comboStep]} BOT -${Math.round(hit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 25,
                      color: '#ef4444',
                      life: 35,
                    });
                  }
                }
              } else {
                sounds.playPunch();
                if (s.p1Controller.isInvulnerable) {
                  s.floatingTexts.push({
                    id: s.nextEntityId++,
                    text: '¡ESQUIVADO!',
                    x: p1.x,
                    y: p1.y - 25,
                    color: '#38bdf8',
                    life: 25,
                  });
                } else {
                  const hit = CombatSystem.resolveMelee(bot, p1);
                  if (hit.didHit) {
                    sounds.playHit();
                    addSparks(p1.x, p1.y, '#ef4444', 12);
                    s.screenShake = bot.comboStep === 2 ? 8 : 5;
                    const comboNames = ['¡JAB!', '¡CROSS!', '¡PATADA!'];
                    s.floatingTexts.push({
                      id: s.nextEntityId++,
                      text: `${comboNames[bot.comboStep]} -${Math.round(hit.damageDealt)}`,
                      x: p1.x,
                      y: p1.y - 25,
                      color: '#ef4444',
                      life: 35,
                    });
                  }
                }
              }'''

assert bot_ai_old in text, "bot_ai_old not found"
text = text.replace(bot_ai_old, bot_ai_new, 1)

# ─────────────────────────────────────────────────────────────
# 4. RENDER FIGHTER WITH BLADE ANIMATIONS & SLASH TRAILS
# ─────────────────────────────────────────────────────────────
render_old = '''        // 1. Si cuenta con un spritesheet multicelda válido y explícito
        if (isWalking && cfg?.hasWalkSheet && sheet && sheet.complete && sheet.naturalWidth > 0 && sheet.naturalHeight > 0) {'''

render_new = '''        const isBlade = isBladeWeapon(p.equippedWeapon);
        const isBladeAttacking =
          isBlade &&
          (p.fsm === PlayerFSMState.MeleeAttack || p.isSliding || p.isChargingHeavy);

        // Si el personaje está blandiendo un arma de filo (cuchillos, katanas, machetes, espadas, hachas):
        // Se ejecuta la coreografía marcial de la hoja del spritesheet de 16 fotogramas con arcos de corte y estelas.
        if (
          isBladeAttacking &&
          s.swordComboSheet &&
          s.swordComboSheet.complete &&
          s.swordComboSheet.naturalWidth > 0
        ) {
          const swordCols = 4;
          const swordRows = 4;
          const sw = s.swordComboSheet.naturalWidth / swordCols;
          const sh = s.swordComboSheet.naturalHeight / swordRows;
          let sFrame = 0;
          if (p.isChargingHeavy) {
            sFrame = 2; // Guardia alta cargando poder
          } else if (p.isSliding) {
            sFrame = 10; // Tajo rasante rozando el suelo
          } else if (p.fsm === PlayerFSMState.MeleeAttack) {
            if (p.comboStep === 0) sFrame = 4; // Tajo 1 horizontal con arco
            else if (p.comboStep === 1) sFrame = 5; // Tajo 2 cleave diagonal
            else sFrame = 12; // Tajo 3 estocada / remate devastador
          }
          const sCol = sFrame % swordCols;
          const sRow = Math.floor(sFrame / swordCols);
          const sx = sCol * sw;
          const sy = sRow * sh;

          const swordDrawW = charW * 1.5;
          const swordDrawH = charH * 1.5;
          const swordDrawX = -swordDrawW / 2 + 10;
          const swordDrawY = -swordDrawH / 2 - 4;

          ctx.drawImage(s.swordComboSheet, sx, sy, sw, sh, swordDrawX, swordDrawY, swordDrawW, swordDrawH);

          // Arco y estela dinámica de corte con brillo de acero
          ctx.save();
          ctx.strokeStyle = '#e0f2fe';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 3.8;
          ctx.beginPath();
          if (p.isSliding) {
            ctx.moveTo(-8, 16);
            ctx.quadraticCurveTo(24, 22, 54, 14);
          } else if (p.comboStep === 0) {
            ctx.arc(8, -6, 42, -Math.PI * 0.35, Math.PI * 0.35, false);
          } else if (p.comboStep === 1) {
            ctx.arc(6, -10, 44, -Math.PI * 0.6, Math.PI * 0.15, false);
          } else {
            ctx.arc(12, -2, 48, -Math.PI * 0.45, Math.PI * 0.45, false);
          }
          ctx.stroke();
          ctx.restore();
        } else if (isWalking && cfg?.hasWalkSheet && sheet && sheet.complete && sheet.naturalWidth > 0 && sheet.naturalHeight > 0) {'''

assert render_old in text, "render_old not found"
text = text.replace(render_old, render_new, 1)

# Ensure held weapon in hand does not overlap while sword animation frame is active
weapon_draw_old = '''        // Arma equipada en mano (proporcional al personaje aumentado)
        if (p.equippedWeapon !== WeaponType.Fists) {
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.drawImage(wImg, 8, -6, 32, 16);
          }
        }'''

weapon_draw_new = '''        // Arma equipada en mano (proporcional al personaje aumentado)
        // Si está ejecutando el ataque de filo, el arma ya forma parte de la animación fluida del spritesheet
        if (p.equippedWeapon !== WeaponType.Fists && !isBladeAttacking) {
          const wImg = s.weaponImages[p.equippedWeapon];
          if (wImg && wImg.complete && wImg.naturalWidth > 0) {
            ctx.drawImage(wImg, 8, -6, 32, 16);
          }
        }'''

assert weapon_draw_old in text, "weapon_draw_old not found"
text = text.replace(weapon_draw_old, weapon_draw_new, 1)

with open('src/components/ArenaCanvas.tsx', 'w') as f:
    f.write(text)

print('ArenaCanvas successfully updated!')
