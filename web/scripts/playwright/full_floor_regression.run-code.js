async (page) => {
  const ARTIFACT_DIR = '/Users/miselin/src/survive-the-dungeon/output/playwright';
  const SEED = 'pw-regression-seed-2026-02-21-a';

  const report = {
    seed: SEED,
    startedAt: new Date().toISOString(),
    checks: [],
    floors: [],
    artifacts: [],
    errors: [],
  };

  const pass = (name, detail = '') => report.checks.push({ name, pass: true, detail });
  const fail = (name, detail = '') => {
    report.checks.push({ name, pass: false, detail });
    report.errors.push(`${name}${detail ? `: ${detail}` : ''}`);
  };

  const shot = async (name) => {
    const path = `${ARTIFACT_DIR}/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    report.artifacts.push(path);
  };

  const snapshot = async () => page.evaluate(() => window.__surviveDebug?.snapshot() ?? null);

  const resolveTransientOverlays = async (max = 16) => {
    for (let i = 0; i < max; i += 1) {
      const snap = await snapshot();
      if (!snap) {
        return;
      }
      if (snap.overlay === 'level-up') {
        await page.evaluate(() => window.__surviveDebug?.allocateLevelUp('str'));
        continue;
      }
      if (snap.overlay === 'shop-reward') {
        await page.evaluate(() => window.__surviveDebug?.claimShopReward('bonus-point'));
        continue;
      }
      if (snap.overlay === 'chest') {
        const lootAll = page.locator("button[data-action='loot-all']");
        if (await lootAll.count() > 0) {
          await lootAll.first().click();
          await page.waitForTimeout(40);
        } else {
          await page.evaluate(() => window.__surviveDebug?.lootAll());
        }
        continue;
      }
      if (snap.overlay === 'battle') {
        await page.evaluate(() => window.__surviveDebug?.resolveCombat('normal', 32));
        continue;
      }
      break;
    }
  };

  const ensureSeededRun = async () => {
    const startVisible = await page.getByRole('button', { name: 'Start Run' }).isVisible().catch(() => false);
    if (!startVisible) {
      await page.evaluate(() => window.__surviveDebug?.closeOverlay?.()).catch(() => {});
      const close = page.locator("button[data-action='close']");
      if (await close.count() > 0) {
        await close.first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(80);
      }
      const newRun = page.getByRole('button', { name: 'New Run' });
      if (await newRun.isVisible().catch(() => false)) {
        await newRun.click({ force: true });
      }
    }

    const input = page.getByRole('textbox', { name: 'Seed phrase (optional)' });
    if (await input.isVisible().catch(() => false)) {
      await input.fill(SEED);
      await page.getByRole('button', { name: 'Start Run' }).click();
      await page.waitForTimeout(80);
    }

    const seedText = await page.locator('#seed-value').textContent().catch(() => null);
    if (seedText && seedText.includes(SEED)) {
      pass('Seed applied', seedText.trim());
    } else {
      fail('Seed applied', String(seedText));
    }

    const hasDebug = await page.evaluate(() => !!window.__surviveDebug);
    if (hasDebug) {
      pass('Debug bridge available');
    } else {
      fail('Debug bridge available');
      return;
    }

    await page.evaluate(() => window.__surviveDebug?.setRevealMap(true));
    await page.evaluate(() => window.__surviveDebug?.grantRegressionPower());
    pass('Regression power enabled');
  };

  const openInventoryAndManipulate = async (floor) => {
    const inventoryBtn = page.getByRole('button', { name: 'Inventory' });
    await inventoryBtn.click();
    await page.waitForTimeout(60);

    const invHeading = page.getByRole('heading', { name: 'Inventory' });
    if (await invHeading.isVisible().catch(() => false)) {
      pass(`Floor ${floor}: inventory opens`);

      const equip = page.locator("button[data-action='inv-equip']");
      if (await equip.count() > 0) {
        await equip.first().click();
        pass(`Floor ${floor}: inventory equip action`);
      }

      const use = page.locator("button[data-action='inv-use']");
      if (await use.count() > 0) {
        await use.first().click();
        pass(`Floor ${floor}: inventory use action`);
      }

      const close = page.locator("button[data-action='close']");
      if (await close.count() > 0) {
        await close.first().click();
      } else {
        await page.evaluate(() => window.__surviveDebug?.closeOverlay());
      }
    } else {
      fail(`Floor ${floor}: inventory opens`);
    }
  };

  const goToShopAndBuy = async (floor) => {
    const moved = await page.evaluate(() => window.__surviveDebug?.moveToRoom('shop'));
    await resolveTransientOverlays();
    let afterMove = await snapshot();

    if (moved?.ok) {
      pass(`Floor ${floor}: move to shop room`, JSON.stringify(moved));
    } else {
      fail(`Floor ${floor}: move to shop room`, JSON.stringify(moved));
    }

    if (afterMove?.overlay === 'shop-reward') {
      await page.evaluate(() => window.__surviveDebug?.claimShopReward('bonus-point'));
      pass(`Floor ${floor}: shop reward claimed`);
      afterMove = await snapshot();
    }

    if (!afterMove || !afterMove.player) {
      fail(`Floor ${floor}: state after shop move`);
      return;
    }

    if (!await page.evaluate(() => window.__surviveDebug?.canOpenShop() ?? false)) {
      const retry = await page.evaluate(() => window.__surviveDebug?.moveToRoom('shop'));
      await resolveTransientOverlays();
      pass(`Floor ${floor}: shop room retry`, JSON.stringify(retry));
    }

    const canOpenShop = await page.evaluate(() => window.__surviveDebug?.canOpenShop() ?? false);
    if (!canOpenShop) {
      fail(`Floor ${floor}: can open shop`);
      return;
    }

    await page.getByRole('button', { name: 'Shop' }).click();
    await page.waitForTimeout(80);

    const heading = page.getByRole('heading', { name: 'Shop' });
    if (await heading.isVisible().catch(() => false)) {
      pass(`Floor ${floor}: shop overlay opens`);

      const buyable = page.locator("button[data-action='shop-buy']:not([disabled])");
      const count = await buyable.count();
      if (count > 0) {
        await buyable.first().click();
        pass(`Floor ${floor}: bought shop item/service`);
      } else {
        pass(`Floor ${floor}: shop had no affordable entries`);
      }

      const close = page.locator("button[data-action='close']");
      if (await close.count() > 0) {
        await close.first().click();
      }
    } else {
      fail(`Floor ${floor}: shop overlay opens`);
    }

    await resolveTransientOverlays();
  };

  const doCombatUxCheck = async (floor) => {
    await resolveTransientOverlays();
    const moved = await page.evaluate(() => window.__surviveDebug?.moveToMob());
    const snap = await snapshot();

    if (!moved?.ok || snap?.overlay !== 'battle') {
      fail(`Floor ${floor}: enter combat`, JSON.stringify({ moved, overlay: snap?.overlay }));
      return;
    }

    pass(`Floor ${floor}: enter combat`);

    const normalSub = await page.locator("button[data-action='combat-normal'] small").textContent().catch(() => null);
    const offSub = await page.locator("button[data-action='combat-offensive'] small").textContent().catch(() => null);
    const defSub = await page.locator("button[data-action='combat-defensive'] small").textContent().catch(() => null);

    if (normalSub && /damage/i.test(normalSub)) {
      pass(`Floor ${floor}: normal subtitle visible`, normalSub.trim());
    } else {
      fail(`Floor ${floor}: normal subtitle visible`, String(normalSub));
    }
    if (offSub && /damage/i.test(offSub) && /defense/i.test(offSub)) {
      pass(`Floor ${floor}: offensive subtitle visible`, offSub.trim());
    } else {
      fail(`Floor ${floor}: offensive subtitle visible`, String(offSub));
    }
    if (defSub && /damage/i.test(defSub) && /defense/i.test(defSub)) {
      pass(`Floor ${floor}: defensive subtitle visible`, defSub.trim());
    } else {
      fail(`Floor ${floor}: defensive subtitle visible`, String(defSub));
    }

    await page.locator("button[data-action='combat-offensive']").click();
    await page.waitForTimeout(60);

    const skipAll = page.locator("input[data-action='combat-fx-skip-all']");
    if (await skipAll.count() > 0) {
      await skipAll.first().check().catch(() => {});
    }

    for (let i = 0; i < 8; i += 1) {
      const skip = page.locator("button[data-action='combat-fx-skip']");
      if (await skip.count() > 0) {
        await skip.first().click().catch(() => {});
      }
      const cont = page.locator("button[data-action='combat-fx-continue']");
      if (await cont.count() > 0) {
        await cont.first().click().catch(() => {});
      }
      await page.waitForTimeout(40);
      const now = await snapshot();
      if (!now || now.overlay !== 'battle') {
        break;
      }
    }

    const resolved = await page.evaluate(() => window.__surviveDebug?.resolveCombat('normal', 32));
    pass(`Floor ${floor}: resolve combat`, JSON.stringify(resolved));
    await resolveTransientOverlays();
  };

  const lootChestIfAny = async (floor) => {
    const moved = await page.evaluate(() => window.__surviveDebug?.moveToChest());
    const snap = await snapshot();

    if (!moved?.ok) {
      pass(`Floor ${floor}: chest path not available`, JSON.stringify(moved));
      return;
    }

    if (snap?.overlay === 'chest') {
      const lootAll = page.locator("button[data-action='loot-all']");
      if (await lootAll.count() > 0) {
        await lootAll.first().click();
        pass(`Floor ${floor}: chest loot-all via UI`);
      } else {
        await page.evaluate(() => window.__surviveDebug?.lootAll());
        pass(`Floor ${floor}: chest loot-all via debug`);
      }
      await page.waitForTimeout(50);
    } else {
      pass(`Floor ${floor}: reached chest tile without overlay`, JSON.stringify(snap?.overlay));
    }
  };

  const clearBossAndDescend = async (floor) => {
    await resolveTransientOverlays();

    let moved = null;
    let snap = await snapshot();

    for (let i = 0; i < 10; i += 1) {
      moved = await page.evaluate(() => window.__surviveDebug?.moveToRoom('boss'));
      snap = await snapshot();
      if (snap?.overlay === 'battle') {
        break;
      }
      await resolveTransientOverlays();
      snap = await snapshot();
      if (snap?.overlay === 'battle') {
        break;
      }

      const boss = snap?.mobs?.find((mob) => mob.isBoss && mob.alive);
      if (boss) {
        await page.evaluate((id) => window.__surviveDebug?.moveToMob(id), boss.id);
      }
      snap = await snapshot();
      if (snap?.overlay === 'battle') {
        break;
      }
      await resolveTransientOverlays();
    }

    if (snap?.overlay !== 'battle') {
      fail(`Floor ${floor}: boss battle started`, JSON.stringify({ moved, overlay: snap?.overlay }));
      return;
    }

    pass(`Floor ${floor}: boss battle started`);
    await page.evaluate(() => window.__surviveDebug?.resolveCombat('normal', 48));
    await page.waitForTimeout(60);

    let rewardHandled = false;
    for (let i = 0; i < 8; i += 1) {
      const now = await snapshot();
      if (!now) {
        break;
      }
      if (now.floor >= (floor + 1)) {
        break;
      }

      if (now.overlay === 'boss-reward') {
        await page.evaluate(() => window.__surviveDebug?.chooseBossReward('none'));
        if (!rewardHandled) {
          pass(`Floor ${floor}: boss reward chosen via debug (none)`);
          rewardHandled = true;
        }
        await page.waitForTimeout(40);
        continue;
      }

      await resolveTransientOverlays();
      await page.waitForTimeout(40);
    }

    await resolveTransientOverlays();
    const post = await snapshot();
    if (post && post.floor >= (floor + 1)) {
      pass(`Floor ${floor}: advanced to next floor`, `now floor ${post.floor}`);
    } else {
      fail(`Floor ${floor}: advanced to next floor`, JSON.stringify(post));
    }
  };

  await ensureSeededRun();
  await shot('seeded-start');

  for (const floor of [1, 2]) {
    const before = await snapshot();
    if (!before || before.state !== 'playing') {
      fail(`Floor ${floor}: run is active`, JSON.stringify(before));
      break;
    }
    if (before.floor !== floor) {
      fail(`Floor ${floor}: expected floor`, `got ${before.floor}`);
      break;
    }

    await openInventoryAndManipulate(floor);
    await goToShopAndBuy(floor);
    await shot(`floor-${floor}-shop`);
    await lootChestIfAny(floor);
    await doCombatUxCheck(floor);
    await shot(`floor-${floor}-combat`);
    await clearBossAndDescend(floor);
    await shot(`floor-${floor}-post-boss`);

    const after = await snapshot();
    report.floors.push({ floor, before, after });

    if (!after || after.state !== 'playing') {
      break;
    }
  }

  const finalSnap = await snapshot();
  report.finishedAt = new Date().toISOString();
  report.final = finalSnap;
  report.passCount = report.checks.filter((c) => c.pass).length;
  report.failCount = report.checks.filter((c) => !c.pass).length;

  await shot('final-state');

  return report;
}
