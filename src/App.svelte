<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';
  import GapPanel from './lib/components/GapPanel.svelte';
  import ScreenCanvas from './lib/components/ScreenPanel/ScreenPanel.svelte';
  import ScreenCanvasOverlay from './lib/components/ScreenCanvasOverlay.svelte';
  import { star } from './lib/stores/luckyStar.store';
  import { textScrambler } from './lib/utils/textScrambler.util';
  import {
    getNetworkInfo,
    type NetworkInfo,
  } from './lib/services/networkInfo.service';

  //TODO refactor this big mess

  let transitionDurationMs = 300;
  let frameIntervalMs = 60;
  let networkInfo: NetworkInfo = {
    ipV4: '',
    ipV6: '',
    userCity: '',
    localTime: '',
    userTime: '',
    localCity: '',
  };
  let headerText =
    'Digital Design & Creative Coding Studio crafting distinctive experiences across interactive systems and visual narratives. Digital flagships, editorial platforms, interactive lookbooks, AR/VR, Web3 identities, generative AI. Based in Paris, working worldwide. ©2025';
  let ipV4Text = '';
  let userCityText = '';
  let localCityText = '';
  let userTimeText = '';
  let localTimeText = '';
  let ipV6Text = '';
  let mailText = 'contact@robertmonpierre.studio';
  let contactText = 'contact';

  const scramblerConfig: Record<
    string,
    { text: () => string; setter: (val: string) => void }
  > = {
    header: {
      text: () => headerText,
      setter: (val: string) => (headerText = val),
    },
    ipV4: {
      text: () => networkInfo.ipV4,
      setter: (val: string) => (ipV4Text = val),
    },
    userCity: {
      text: () => networkInfo.userCity,
      setter: (val: string) => (userCityText = val),
    },
    localCity: {
      text: () => networkInfo.localCity,
      setter: (val: string) => (localCityText = val),
    },
    userTime: {
      text: () => networkInfo.userTime,
      setter: (val: string) => (userTimeText = val),
    },
    localTime: {
      text: () => networkInfo.localTime,
      setter: (val: string) => (localTimeText = val),
    },
    ipV6: {
      text: () => networkInfo.ipV6,
      setter: (val: string) => (ipV6Text = val),
    },
    mail: {
      text: () => 'robertmonpierre@studio.com',
      setter: (val: string) => (mailText = val),
    },
    contact: {
      text: () => 'contact',
      setter: (val: string) => (contactText = val),
    },
  };

  const scramblers: Record<string, { stop: () => void } | null> = {
    header: null,
    ipV4: null,
    userCity: null,
    ipV6: null,
    mail: null,
    contact: null,
  };

  $: isStarActive = $star.active;
  let previousStarActive = $star.active;
  let mainEl: HTMLElement;

  function startScrambler(key: string, isInfinite?: boolean) {
    if (!scramblers[key]) {
      scramblers[key] = textScrambler(
        scramblerConfig[key].text(),
        scramblerConfig[key].setter,
        transitionDurationMs,
        frameIntervalMs,
        isInfinite
      );
    }
  }

  function stopScrambler(key: string) {
    if (scramblers[key]) {
      scramblers[key].stop();
      scramblers[key] = null;
    }
  }

  function handleStarActiveChange(newValue: boolean, oldValue: boolean) {
    if (newValue === oldValue) return;

    if (newValue) {
      // Animate main element
      gsap.to(mainEl, {
        background:
          'radial-gradient(circle at 100% 0%, white 0%, rgb(150 150 150) 100%)',
        duration: 0.7,
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      });

      // Animate overlay
      if (overlayEl) {
        gsap.to(overlayEl, {
          left: '80px',
          duration: 0.3,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }

      // Animate gap panel
      if (gapPanelEl) {
        gsap.to(gapPanelEl, {
          width: '20px',
          duration: 0.3,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }

      // Animate first panel
      if (firstPanelEl) {
        gsap.to(firstPanelEl, {
          width: '55%',
          duration: 0.3,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }
    } else {
      // Animate main element
      gsap.to(mainEl, {
        background: 'black',
        duration: 0.7,
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      });

      // Animate overlay
      if (overlayEl) {
        gsap.to(overlayEl, {
          left: '0',
          duration: 0.3,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }

      // Animate gap panel
      if (gapPanelEl) {
        gsap.to(gapPanelEl, {
          width: '0%',
          duration: 0.3,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }

      // Animate first panel
      if (firstPanelEl) {
        gsap.to(firstPanelEl, {
          width: '0%',
          duration: 0.3,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }
    }

    Object.keys(scramblerConfig).forEach((key) => {
      if (key === 'header') {
        if (newValue) {
          startScrambler(key, true);
        } else {
          setTimeout(() => stopScrambler(key), transitionDurationMs);
        }
      } else {
        if (newValue) {
          startScrambler(key);
        } else {
          stopScrambler(key);
          startScrambler(key);
          setTimeout(() => stopScrambler(key), transitionDurationMs);
        }
      }
    });

    previousStarActive = newValue;
  }

  $: handleStarActiveChange($star.active, previousStarActive);

  let colonInterval: ReturnType<typeof setInterval> | null = null;

  function updateColonInterval() {
    if (colonInterval) clearInterval(colonInterval);
    const intervalMs = isStarActive ? 125 : 500;
    colonInterval = setInterval(() => {
      if (colonEl) {
        const currentOpacity = gsap.getProperty(colonEl, 'opacity') as number;
        gsap.to(colonEl, {
          opacity: currentOpacity === 0 ? 1 : 0,
          duration: 0.15,
          ease: 'power2.inOut',
        });
      }
    }, intervalMs);
  }

  $: if (typeof isStarActive !== 'undefined') updateColonInterval();

  let headerEl: HTMLElement;
  let contactEl: HTMLElement;
  let overlayEl: HTMLElement;
  let gapPanelEl: HTMLElement;
  let firstPanelEl: HTMLElement;
  let colonEl: HTMLElement;

  onMount(async () => {
    networkInfo = await getNetworkInfo();
    ipV4Text = networkInfo.ipV4;
    userCityText = networkInfo.userCity;
    localCityText = networkInfo.localCity;
    userTimeText = networkInfo.userTime;
    localTimeText = networkInfo.localTime;
    ipV6Text = networkInfo.ipV6;

    if (isStarActive && mainEl) {
      handleStarActiveChange(true, false);
      previousStarActive = true;
    }

    gsap.set([headerEl, contactEl], { transition: 'none' });

    gsap.from(mainEl, {
      opacity: 0,
      duration: 5,
      ease: 'power2.out',
    });
    gsap.from(overlayEl, {
      opacity: 0,
      duration: 1,
      delay: 1,
      ease: 'power2.out',
    });
    gsap.from(headerEl, {
      opacity: 0,
      x: -500,
      duration: 0.5,
      delay: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(headerEl, { clearProps: 'transition' });
      },
    });
    gsap.from(contactEl, {
      opacity: 0,
      x: 500,
      duration: 0.5,
      delay: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(contactEl, { clearProps: 'transition' });
      },
    });
  });

  onDestroy(() => {
    if (colonInterval) clearInterval(colonInterval);
  });
</script>

<main bind:this={mainEl} class:is-star-active={isStarActive}>
  <h1 bind:this={headerEl} class="header">
    {headerText}
  </h1>
  <div class="container">
    <div bind:this={gapPanelEl} class="gap-panel">
      <GapPanel />
    </div>
    <div bind:this={overlayEl} class="overlay">
      <ScreenCanvasOverlay />
    </div>
    <div bind:this={firstPanelEl} class="first-panel">
      >
      <ScreenCanvas
        videoPlaybackRate={0.9}
        isLeft={true}
        backgroundColor="white"
        sizePercent={1}
        baseRotationAngleY={-10}
        baseRotationAngleX={0}
        maxRotationRangeY={50}
        maxRotationRangeX={30}
        rotationSmoothing={0.05}
        baseDisplacementStrength={0.1}
      />
    </div>
    <div class="second-panel">
      <ScreenCanvas
        videoPlaybackRate={0.9}
        isLeft={false}
        backgroundColor="black"
        sizePercent={1}
        baseRotationAngleY={-10}
        baseRotationAngleX={0}
        maxRotationRangeY={50}
        maxRotationRangeX={30}
        rotationSmoothing={0.05}
        baseDisplacementStrength={0.1}
      />
    </div>
  </div>
  <div bind:this={contactEl} class="contact">
    <span>
      {isStarActive ? userCityText : localCityText}
      <span bind:this={colonEl} class="colon-fade"> :</span>
      {isStarActive ? userTimeText : localTimeText}
    </span>
    <br />
    <span>{isStarActive ? ipV4Text : contactText}</span>
    <br />
    <span class="mail">{isStarActive ? ipV6Text : mailText}</span>
    <br />
  </div>
</main>

<style lang="scss">
  @use './lib/styles/abstracts/variables' as *;

  main {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    background-color: black;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    overflow: hidden;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
  }

  .container {
    width: min(100vw, 100vh, 732px);
    height: min(100vw, 100vh, 732px);
    aspect-ratio: 1 / 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
    position: fixed;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    box-sizing: border-box;
    background: none;
    z-index: 10;
  }

  .overlay {
    position: absolute;
    bottom: 10%;
    left: 0;
    z-index: 9999;
    display: inline-block;
    width: 40%;
    aspect-ratio: 5 / 3;
  }

  .gap-panel {
    height: 100%;
    width: 0%;
    min-width: 0;
    display: flex;
    align-items: stretch;
    justify-content: center;
    background-color: $background-color;
    overflow: hidden;
  }

  .first-panel {
    height: 100%;
    width: 0%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .second-panel {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    letter-spacing: 0.05em;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    text-align: left;
    font-size: clamp(1.5rem, 4vw, 3.8rem);
    font-weight: 400;
    color: rgb(205, 205, 205);
    letter-spacing: 0.05em;
    margin: 0;
    line-height: 1;
    z-index: 99999;
    pointer-events: none;
    font-family: 'GT America', serif;
    mix-blend-mode: difference;
  }

  .contact {
    position: fixed;
    right: 0.8em;
    bottom: 0.8em;
    font-family: 'GT America', Arial, sans-serif;
    font-size: clamp(1rem, 3vw, 4rem);
    font-weight: 700;
    color: rgb(205, 205, 205);
    letter-spacing: 0.05em;
    z-index: 99999;
    user-select: none;
    pointer-events: none;
    text-align: right;
    text-transform: uppercase;
    mix-blend-mode: difference;
  }

  .colon-fade {
    display: inline-block;
    opacity: 0;
  }

  .mail {
    user-select: all;
    pointer-events: all;
    &.active {
      user-select: none;
      pointer-events: none;
    }
  }
</style>
