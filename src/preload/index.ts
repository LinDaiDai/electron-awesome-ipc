function initEnv() {
  console.log('initEnv...');
  const lindaidai: typeof window.lindaidai = {};
  window.lindaidai = lindaidai;
}

initEnv();