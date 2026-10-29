/* "A look inside": the looping preview of the Compass on the sales page. It
 * sits well below the first screen, so sales.js loads it only as the visitor
 * scrolls near it. Pause and play live here with it. */
export function fill(vid) {
  if (!vid || !vid.hasAttribute('data-lazy')) return;
  vid.removeAttribute('data-lazy'); vid.removeAttribute('aria-label'); vid.style.minHeight = '';
  vid.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; padding: 4px 6px 12px" aria-hidden="true"><span style="width: 10px; height: 10px; border-radius: 50%; background: #C8432B"></span><span style="width: 10px; height: 10px; border-radius: 50%; background: #C9A24A"></span><span style="width: 10px; height: 10px; border-radius: 50%; background: #2F7D5B"></span><span style="margin-left: 12px; font-size: 12px; color: #A9B2C4; font-weight: 700; letter-spacing: .1em">LEADERSHIP COMPASS</span></div>
        <div style="background: #F3EFEA; border-radius: 8px; display: flex; flex-wrap: wrap; overflow: hidden; min-height: 400px" role="img" aria-label="An animated preview of the Compass: your road from where you are to your goal, eight questions on one page, your compass reading, and the what-if lab.">
          <div style="flex: 1 1 200px; background: #FFFFFF; border-right: 1px solid #E6DCCB; padding: 18px; display: flex; flex-direction: column; gap: 6px" aria-hidden="true">
            <span style="font-weight: 900; font-size: 12px; letter-spacing: .14em; margin-bottom: 8px">YOUR COMPASS</span>
            <span class="side side1" style="padding: 10px 12px; border-radius: 4px; font-size: 14px; font-weight: 700">01 Get clear</span>
            <span class="side side2" style="padding: 10px 12px; border-radius: 4px; font-size: 14px; font-weight: 700">02 Lead your people</span>
            <span class="side side3" style="padding: 10px 12px; border-radius: 4px; font-size: 14px; font-weight: 700">03 Count what matters</span>
            <span class="side side4" style="padding: 10px 12px; border-radius: 4px; font-size: 14px; font-weight: 700">04 Choose your next steps</span>
          </div>
          <div class="lookin" style="flex: 999 1 300px; min-width: 0; position: relative; min-height: 400px" aria-hidden="true">
            <div class="scr scr1" style="position: absolute; inset: 0; padding: 28px; display: flex; flex-direction: column; gap: 18px">
              <span style="font-weight: 900; font-size: 12px; letter-spacing: .14em; color: #7A5E26">STEP 1 · WHERE ARE YOU TODAY?</span>
              <div style="position: relative; height: 70px; margin: 0 6%">
                <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 3px dashed #D8CDBB"></div>
                <div class="ln" style="position: absolute; left: 0; width: 34%; top: 50%; margin-top: -2px; height: 4px; background: #C9A24A"></div>
                <span style="position: absolute; left: 0; top: 50%; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%; background: #C9A24A; border: 3px solid #15213B"></span>
                <span style="position: absolute; left: 33%; top: 50%; width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%; background: #FFFFFF; border: 3px solid #C9A24A"></span>
                <span style="position: absolute; left: 66%; top: 50%; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: #E6DCCB"></span>
                <span style="position: absolute; left: 100%; top: 50%; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: #E6DCCB"></span>
              </div>
              <span style="font-size: 16px"><b>You are here:</b> Building → <b>Your goal:</b> Growing · one stage to go</span>
            </div>
            <div class="scr scr2" style="position: absolute; inset: 0; padding: 28px; display: flex; flex-direction: column; gap: 14px">
              <span style="font-weight: 900; font-size: 12px; letter-spacing: .14em; color: #7A5E26">8 QUESTIONS · ONE PAGE · 5/8</span>
              <span style="font-weight: 900; font-size: 20px; line-height: 1.25">Do you know what you sell, what it costs you and how long it takes?</span>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; font-weight: 700"><span style="border: 1.5px solid #D8CDBB; padding: 10px; background: #FFFFFF">Not yet</span><span class="c2" style="border: 1.5px solid #15213B; padding: 10px">I think so</span><span style="border: 1.5px solid #D8CDBB; padding: 10px; background: #FFFFFF">Mostly</span><span style="border: 1.5px solid #D8CDBB; padding: 10px; background: #FFFFFF">Yes, I’ve checked</span></div>
            </div>
            <div class="scr scr3" style="position: absolute; inset: 0; padding: 28px; display: flex; gap: 18px; align-items: center; flex-wrap: wrap">
              <svg viewBox="0 0 200 200" style="width: 170px; height: 170px"><circle cx="100" cy="100" r="80" fill="none" stroke="#D8CDBB"/><circle cx="100" cy="100" r="40" fill="none" stroke="#E6DCCB"/><line x1="100" y1="20" x2="100" y2="180" stroke="#E6DCCB"/><line x1="20" y1="100" x2="180" y2="100" stroke="#E6DCCB"/><polygon points="100,34 158,100 100,140 62,100" fill="rgba(201,162,74,.35)" stroke="#C9A24A" stroke-width="2.5"/></svg>
              <div style="display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 160px"><span style="font-weight: 900; font-size: 12px; letter-spacing: .14em; color: #7A5E26">YOUR COMPASS READING</span><span><b>Your strength:</b> Lead your people</span><span><b>Start here:</b> Lead the market</span><span style="font-size: 13px; color: #3D4966">Ask yourself: “Can you say, in their words, what problem they pay you to solve?”</span></div>
            </div>
            <div class="scr scr4" style="position: absolute; inset: 0; padding: 28px; display: flex; flex-direction: column; gap: 12px">
              <span style="font-weight: 900; font-size: 12px; letter-spacing: .14em; color: #7A5E26">WHAT IF? · SOMEONE ELSE DID PART OF THE WORK</span>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 15px">
                <span>→ Your hours, each month <b style="color: #2F7D5B">↓ 72 h</b></span>
                <span>→ Cash, each month <b style="color: #B5512E">↓ some, at first</b></span>
                <span>→ Clients, each month <b>→ same</b></span>
              </div>
              <span style="font-size: 14px; color: #3D4966">“You buy back your time. Decide whether that trade is worth it to you.”</span>
            </div>
          </div>
        </div>
        <div style="height: 4px; background: #2B3A5C; border-radius: 2px; margin-top: 12px; overflow: hidden" aria-hidden="true"><div class="prog" style="height: 4px; background: #C9A24A; transform-origin: left"></div></div>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 4px 2px; flex-wrap: wrap">
          <button type="button" id="play" aria-pressed="false" style="min-height: 44px; padding: 0 18px; background: transparent; border: 1.5px solid #C9A24A; color: #C9A24A; font-weight: 900; font-size: 14px; border-radius: 4px; cursor: pointer">❚❚ Pause</button>
          <span style="font-size: 12px; color: #A9B2C4">Animated preview of the Compass screens · example figures</span>
        </div>
      `;
  const play = vid.querySelector('#play');
  if (play) play.addEventListener('click', () => {
    const paused = play.getAttribute('aria-pressed') !== 'true';
    play.setAttribute('aria-pressed', String(paused));
    play.textContent = paused ? '▶ Play' : '❚❚ Pause';
    vid.style.setProperty('--ps', paused ? 'paused' : 'running');
  });
}
