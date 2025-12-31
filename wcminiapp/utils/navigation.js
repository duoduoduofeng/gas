function backAndRefreshPrevious(preferredMethods) {
  const pages = getCurrentPages();
  const prev = pages && pages.length >= 2 ? pages[pages.length - 2] : null;

  wx.navigateBack({
    delta: 1,
    success: () => {
      if (!prev) return;

      const methods = Array.isArray(preferredMethods) && preferredMethods.length
        ? preferredMethods
        : ['loadDetail', 'loadStations', 'onRefresh'];

      for (let i = 0; i < methods.length; i += 1) {
        const fn = prev[methods[i]];
        if (typeof fn === 'function') {
          fn.call(prev);
          break;
        }
      }
    }
  });
}

module.exports = {
  backAndRefreshPrevious
};