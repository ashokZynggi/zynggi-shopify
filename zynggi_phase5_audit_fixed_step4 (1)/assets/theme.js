(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const money = c =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(c / 100);



  /* =========================================================
     ACCESSIBLE NOTIFICATIONS
     ========================================================= */

  window.zynggiNotify = (message, type = 'error') => {
    let toast = document.getElementById('zynggi-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'zynggi-toast';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:99999;max-width:min(420px,calc(100vw - 32px));padding:12px 16px;border-radius:10px;background:#2b1714;color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.18);font-size:14px;line-height:1.45;';
      document.body.appendChild(toast);
    }
    toast.textContent = String(message || 'Something went wrong.');
    toast.dataset.type = type;
    clearTimeout(window.__zynggiToastTimer);
    window.__zynggiToastTimer = setTimeout(() => {
      if (toast) toast.remove();
    }, 4500);
  };

  /* =========================================================
     DRAWERS
     Mobile menu + cart drawer
     ========================================================= */

  const drawerState = new WeakMap();

  const getFocusable = root =>
    root
      ? $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      : [];

  const setDialogState = (dialog, open) => {
    if (!dialog) return;
    dialog.setAttribute('aria-hidden', open ? 'false' : 'true');
  };

  const openDrawer = el => {
    if (!el) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawerState.set(el, { opener });
    el.classList.add('is-open');
    setDialogState(el, true);
    document.body.classList.add('no-scroll');

    if (opener && opener.matches('[data-drawer-open]')) {
      opener.setAttribute('aria-expanded', 'true');
    }

    const panel = $('.drawer__panel', el);
    const focusable = getFocusable(panel);

    if (focusable.length) {
      setTimeout(() => focusable[0].focus(), 50);
    }
  };

  const closeDrawer = (drawer, restoreFocus = true) => {
    if (!drawer) return;

    const state = drawerState.get(drawer);
    drawer.classList.remove('is-open');
    setDialogState(drawer, false);

    if (state?.opener && state.opener.matches('[data-drawer-open]')) {
      state.opener.setAttribute('aria-expanded', 'false');
      if (restoreFocus && document.contains(state.opener)) {
        setTimeout(() => state.opener.focus(), 0);
      }
    }

    drawerState.delete(drawer);
  };

  const closeDrawers = () => {
    const open = $$('.drawer.is-open');
    open.forEach(drawer => closeDrawer(drawer, true));
    document.body.classList.remove('no-scroll');
  };

  // Keep keyboard focus inside open drawers so keyboard users cannot tab behind the overlay.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;

    const drawer = $('.drawer.is-open');
    if (!drawer) return;

    const panel = $('.drawer__panel', drawer);
    const focusable = getFocusable(panel);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;

    const modal = $('.zynggi-order-modal.is-open') || $('.zynggi-admin-stock-modal-backdrop.is-open');
    if (!modal) return;

    const panel = modal.querySelector('[role="dialog"]') || modal.querySelector('.zynggi-admin-stock-modal');
    const focusable = getFocusable(panel);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });



  /* =========================================================
     MOBILE MENU OPEN
     ========================================================= */

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-drawer-open]');

    if (!button) {
      return;
    }

    event.preventDefault();

    const drawerId = button.dataset.drawerOpen;
    const drawer = document.getElementById(drawerId);

    if (!drawer) {
      return;
    }

    openDrawer(drawer);
  });


  /* =========================================================
     DRAWER CLOSE
     ========================================================= */

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-drawer-close]');

    if (!button) {
      return;
    }

    event.preventDefault();

    closeDrawers();
  });


  /* =========================================================
     ESC KEY
     ========================================================= */

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeDrawers();

      const search = $('#search');

      if (search) {
        search.classList.remove('is-open');
      }

      document.body.classList.remove('no-scroll');
    }
  });


  /* =========================================================
     SEARCH OPEN
     ========================================================= */

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-search-open]');

    if (!button) {
      return;
    }

    event.preventDefault();

    const search = $('#search');

    if (!search) {
      return;
    }

    search.classList.add('is-open');
    search.setAttribute('aria-hidden', 'false');
    search.dataset.searchOpener = button.id || '';
    document.body.classList.add('no-scroll');

    const input = $('input', search);

    if (input) {
      setTimeout(() => {
        input.focus();
      }, 50);
    }
  });


  /* =========================================================
     SEARCH CLOSE
     ========================================================= */

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-search-close]');

    if (!button) {
      return;
    }

    event.preventDefault();

    const search = $('#search');

    if (search) {
      search.classList.remove('is-open');
      search.setAttribute('aria-hidden', 'true');
    }

    document.body.classList.remove('no-scroll');
  });


  /* =========================================================
     ZYNGGI CATEGORY RAIL AUTO-SCROLL
     
     Behaviour:
     - Phone only
     - 3+ categories visible
     - User can swipe normally
     - Auto-scroll pauses during interaction
     - Auto-scroll resumes after user interaction
     - Does NOT instantly jump back to first category
     - Moves one category at a time
     ========================================================= */

  function initCategoryAutoScroll(root) {
    const rails = (root || document).querySelectorAll(
      '.category-rail[data-category-autoplay]'
    );

    rails.forEach(rail => {
      if (rail.dataset.categoryAutoInitialized === 'true') {
        return;
      }

      const list = rail.querySelector(
        '.category-rail__list'
      );

      if (!list) {
        return;
      }

      rail.dataset.categoryAutoInitialized = 'true';

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );

      let timer = null;
      let resumeTimer = null;
      let paused = false;
      let isUserInteracting = false;


      /* -------------------------------------------------------
         DEVICE CHECK
         ------------------------------------------------------- */

      const isPhone = () => {
        return window.matchMedia(
          '(max-width: 749px)'
        ).matches;
      };


      /* -------------------------------------------------------
         GET ITEM STEP
         ------------------------------------------------------- */

      const getItemStep = () => {
        const item = list.querySelector(
          '.category-rail__item'
        );

        if (!item) {
          return list.clientWidth * 0.8;
        }

        const styles = window.getComputedStyle(list);

        const gap =
          parseFloat(
            styles.columnGap ||
            styles.gap ||
            '0'
          ) || 0;

        return (
          item.getBoundingClientRect().width +
          gap
        );
      };


      /* -------------------------------------------------------
         GET MAX SCROLL
         ------------------------------------------------------- */

      const getMaxScroll = () => {
        return Math.max(
          0,
          list.scrollWidth -
          list.clientWidth
        );
      };


      /* -------------------------------------------------------
         STOP TIMER
         ------------------------------------------------------- */

      const stop = () => {
        if (timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }

        if (resumeTimer !== null) {
          window.clearTimeout(resumeTimer);
          resumeTimer = null;
        }
      };


      /* -------------------------------------------------------
         START TIMER
         ------------------------------------------------------- */

      const start = () => {
        stop();

        if (!isPhone()) {
          return;
        }

        if (reduceMotion.matches) {
          return;
        }

        if (paused || isUserInteracting) {
          return;
        }

        if (
          rail.dataset.categoryAutoplay !== 'true'
        ) {
          return;
        }

        const interval = Math.max(
          3000,
          (
            Number(
              rail.dataset.categoryInterval
            ) || 5
          ) * 1000
        );

        timer = window.setInterval(
          advance,
          interval
        );
      };


      /* -------------------------------------------------------
         AUTO-SCROLL ONE CATEGORY
         ------------------------------------------------------- */

      const advance = () => {
        if (!isPhone()) {
          return;
        }

        if (paused || isUserInteracting) {
          return;
        }

        if (reduceMotion.matches) {
          return;
        }

        if (
          rail.dataset.categoryAutoplay !== 'true'
        ) {
          stop();
          return;
        }

        const maxScroll = getMaxScroll();

        if (maxScroll <= 4) {
          return;
        }

        const step = getItemStep();

        const current = list.scrollLeft;

        /*
         * If we are already at the end,
         * stay there instead of instantly
         * jumping back to the beginning.
         *
         * This prevents the reverse-jump problem.
         */

        if (
          current >=
          maxScroll - 6
        ) {
          /*
           * Stop at the end.
           * Never force the user back to the first
           * category after a manual or automatic swipe.
           */
          stop();
          return;
        }


        const next = Math.min(
          current + step,
          maxScroll
        );


        list.scrollTo({
          left: next,
          behavior: 'smooth'
        });
      };


      /* -------------------------------------------------------
         USER TOUCH / SWIPE
         ------------------------------------------------------- */

      const pauseForUser = () => {
        isUserInteracting = true;
        paused = true;

        stop();
      };


      const resumeAfterUser = () => {
        isUserInteracting = false;
        paused = false;

        stop();

        resumeTimer = window.setTimeout(() => {
          if (!isUserInteracting) {
            start();
          }
        }, 2200);
      };


      /* Pointer

         Pointer Events cover touch, pen, and mouse.
         Using one interaction model avoids duplicate
         touch + pointer callbacks on mobile browsers.
      */

      list.addEventListener(
        'pointerdown',
        pauseForUser
      );

      list.addEventListener(
        'pointerup',
        resumeAfterUser
      );

      list.addEventListener(
        'pointercancel',
        resumeAfterUser
      );


      /* Mouse */

      rail.addEventListener(
        'mouseenter',
        () => {
          paused = true;
          stop();
        }
      );

      rail.addEventListener(
        'mouseleave',
        () => {
          paused = false;
          start();
        }
      );


      /* -------------------------------------------------------
         RESIZE
         ------------------------------------------------------- */

      window.addEventListener(
        'resize',
        () => {
          stop();

          /*
           * Don't reset scroll position here.
           * Resetting caused the rail to jump backwards.
           */

          setTimeout(() => {
            start();
          }, 250);
        },
        {
          passive: true
        }
      );


      /* -------------------------------------------------------
         SHOPIFY THEME EDITOR
         ------------------------------------------------------- */

      document.addEventListener(
        'shopify:section:select',
        event => {
          if (
            event.target.contains(rail) ||
            event.target === rail
          ) {
            stop();

            paused = true;
          }
        }
      );


      document.addEventListener(
        'shopify:section:deselect',
        event => {
          if (
            event.target.contains(rail) ||
            event.target === rail
          ) {
            paused = false;

            start();
          }
        }
      );


      /* -------------------------------------------------------
         INITIALIZE
         ------------------------------------------------------- */

      start();
    });
  }


  /* Initial page load */

  initCategoryAutoScroll();


  /* Shopify Theme Editor section load */

  document.addEventListener(
    'shopify:section:load',
    event => {
      initCategoryAutoScroll(
        event.target
      );
    }
  );


  /* =========================================================
     CART
     ========================================================= */

  const sectionIds = () =>
    $$('[data-cart-section]')
      .map(section => section.dataset.cartSection)
      .join(',') ||
    'cart-drawer';


  async function refreshCart() {
    const response = await fetch(
      `${window.routes.root}?sections=${sectionIds()}`
    );

    const data = await response.json();

    applySections(data);

    return data;
  }


  function applySections(sections) {
    if (!sections) {
      return;
    }

    Object.entries(sections).forEach(
      ([id, html]) => {
        const live = $(
          `[data-cart-section="${id}"]`
        );

        if (!live) {
          return;
        }

        const doc =
          new DOMParser().parseFromString(
            html,
            'text/html'
          );

        const fresh = $(
          `[data-cart-section="${id}"]`,
          doc
        );

        if (fresh) {
          live.innerHTML =
            fresh.innerHTML;
        }
      }
    );

    updateCount();
  }


  function updateCount(itemCount) {
    if (typeof itemCount !== 'number') {
      return;
    }

    $$('[data-cart-count]').forEach(
      element => {
        element.textContent = itemCount;
        element.dataset.count = itemCount;
      }
    );
  }


  async function changeLine(
    line,
    quantity
  ) {
    const response = await fetch(
      window.routes.cart_change + '.js',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          line: +line,
          quantity,
          sections: sectionIds(),
          sections_url: window.location.pathname
        })
      }
    );

    const data =
      await response.json();

    applySections(
      data.sections
    );
    updateCount(data.item_count);
  }


  function showCartError(message) {
    let toast = document.querySelector('[data-cart-error]');

    if (!toast) {
      toast = document.createElement('div');
      toast.dataset.cartError = '';
      toast.className = 'cart-error';
      toast.setAttribute('role', 'alert');
      toast.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;max-width:360px;padding:12px 16px;border-radius:10px;background:#2b1714;color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.18)';
      document.body.appendChild(toast);
    }

    toast.textContent = message || 'Unable to update your cart. Please try again.';
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 5000);
  }


  /* Add to cart */

  document.addEventListener(
    'submit',
    async event => {
      const form =
        event.target.closest(
          'form[data-ajax-cart], form[action*="/cart/add"]'
        );

      if (!form) {
        return;
      }

      if (
        event.submitter &&
        event.submitter.name === 'checkout'
      ) {
        return;
      }

      event.preventDefault();

      const button =
        form.querySelector(
          '[type="submit"]'
        );

      const oldText =
        button &&
        button.textContent;

      if (button) {
        button.disabled = true;
        button.textContent =
          'Adding…';
      }

      const formData =
        new FormData(form);

      formData.append(
        'sections',
        sectionIds()
      );
      formData.append(
        'sections_url',
        window.location.pathname
      );

      try {
        const response =
          await fetch(
            window.routes.cart_add + '.js',
            {
              method: 'POST',
              body: formData,
              headers: {
                Accept:
                  'application/json'
              }
            }
          );

        const data =
          await response.json();

        if (data.status) {
          showCartError(
            data.description ||
            data.message
          );
        } else {
          applySections(
            data.sections
          );
          updateCount(data.item_count);

          if (
            window.themeSettings.cartType ===
              'drawer' &&
            $('#cart-drawer')
          ) {
            const quickView =
              $('#quick-view');

            if (
              quickView &&
              quickView.open
            ) {
              quickView.close();
            }

            openDrawer(
              $('#cart-drawer')
            );
          } else {
            location.href =
              window.routes.cart;
          }
        }
      } catch (error) {
        console.error(
          'Add to cart error:',
          error
        );
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent =
            oldText;
        }
      }
    }
  );


  /* =========================================================
     QUICK VIEW
     ========================================================= */

  /* =========================================================
     CART LINE CONTROLS
     ========================================================= */

  document.addEventListener(
    'click',
    async event => {
      const quantityButton =
        event.target.closest('[data-qty][data-line]');

      const removeButton =
        event.target.closest('[data-remove]');

      if (quantityButton) {
        event.preventDefault();

        const line =
          Number(quantityButton.dataset.line);

        const quantity =
          Math.max(
            0,
            Number(quantityButton.dataset.qty)
          );

        if (line) {
          try {
            await changeLine(
              line,
              quantity
            );
          } catch (error) {
            console.error(
              'Cart update error:',
              error
            );
          }
        }

        return;
      }

      if (removeButton) {
        event.preventDefault();

        const line =
          Number(removeButton.dataset.remove);

        if (line) {
          try {
            await changeLine(
              line,
              0
            );
          } catch (error) {
            console.error(
              'Cart remove error:',
              error
            );
          }
        }
      }
    }
  );


  /* =========================================================
     QUICK VIEW OPEN
     ========================================================= */

  document.addEventListener(
    'click',
    event => {
      const trigger =
        event.target.closest('[data-quick-view]');

      if (!trigger) {
        return;
      }

      event.preventDefault();

      const url =
        trigger.dataset.quickView;

      if (url) {
        quickView(url);
      }
    }
  );


  async function quickView(url) {
    const dialog =
      $('#quick-view');

    if (!dialog) {
      return;
    }

    const body =
      $('[data-qv-body]', dialog);

    if (!body) {
      return;
    }

    body.innerHTML =
      '<p>Loading…</p>';

    if (!dialog.open) {
      dialog.showModal();
    }

    try {
      const response =
        await fetch(
          url +
            (
              url.includes('?')
                ? '&'
                : '?'
            ) +
            'view=quick'
        );

      body.innerHTML =
        await response.text();
    } catch (error) {
      body.innerHTML =
        '<p>Unable to load product.</p>';

      console.error(
        'Quick view error:',
        error
      );
    }
  }


  const quickViewDialog =
    $('#quick-view');

  if (quickViewDialog) {
    quickViewDialog.addEventListener(
      'click',
      event => {
        if (
          event.target.id ===
          'quick-view'
        ) {
          quickViewDialog.close();
        }
      }
    );
  }


  document.addEventListener(
    'click',
    event => {
      const closeButton =
        event.target.closest('[data-qv-close]');

      if (!closeButton) {
        return;
      }

      const dialog =
        document.getElementById('quick-view');

      if (
        dialog &&
        typeof dialog.close === 'function'
      ) {
        dialog.close();
      }
    }
  );


  /* =========================================================
     PREDICTIVE SEARCH
     ========================================================= */

  const searchInput =
    $('#search input');

  let searchTimer;
  let searchController = null;


  const recentSearches = () => {
    try {
      return JSON.parse(
        localStorage.getItem(
          'recent-searches'
        ) || '[]'
      );
    } catch (error) {
      return [];
    }
  };


  function renderRecentSearches() {
    const box =
      $('[data-recent]');

    if (!box) {
      return;
    }

    const searches =
      recentSearches();


    box.innerHTML =
      searches.length
        ? searches
            .map(
              query =>
                `<a class="chip" href="${window.routes.search}?q=${encodeURIComponent(query)}">${query.replace(/</g, '&lt;')}</a>`
            )
            .join('')
        : '';


    const wrapper =
      $('[data-recent-wrap]');

    if (wrapper) {
      wrapper.hidden =
        !searches.length;
    }
  }


  if (searchInput) {
    searchInput.addEventListener(
      'input',
      () => {
        clearTimeout(
          searchTimer
        );

        const query =
          searchInput.value.trim();

        const output =
          $('[data-psearch]');

        if (!output) {
          return;
        }

        if (query.length < 2) {
          output.innerHTML = '';
          return;
        }


        if (searchController) {
          searchController.abort();
        }

        searchTimer =
          setTimeout(
            async () => {
              searchController =
                new AbortController();

              try {
                const response =
                  await fetch(
                    `${window.routes.predictive}?q=${encodeURIComponent(query)}&resources[type]=product,collection,article,query&resources[limit]=5&section_id=predictive-search`,
                    { signal: searchController.signal }
                  );

                const html =
                  await response.text();

                const doc =
                  new DOMParser()
                    .parseFromString(
                      html,
                      'text/html'
                    );

                const section =
                  $(
                    '#shopify-section-predictive-search',
                    doc
                  );

                output.innerHTML =
                  section
                    ? section.innerHTML
                    : '';
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.error(
                    'Predictive search error:',
                    error
                  );
                }
              }
            },
            220
          );
      }
    );


    const searchForm =
      $('#search form');

    if (searchForm) {
      searchForm.addEventListener(
        'submit',
        () => {
          const query =
            searchInput.value.trim();

          if (!query) {
            return;
          }

          const updated =
            [
              query,
              ...recentSearches()
                .filter(
                  item =>
                    item !== query
                )
            ].slice(0, 5);

          try {
            localStorage.setItem(
              'recent-searches',
              JSON.stringify(updated)
            );
          } catch (error) {
            // Ignore storage failures in private/restricted browsing modes.
          }
        }
      );
    }


    renderRecentSearches();
  }


  /* =========================================================
     COLLECTION FILTERS
     ========================================================= */

  async function refreshCollection(url, pushHistory = true) {
    const current =
      document.querySelector('[data-collection-section]');

    if (!current) {
      window.location.href = url.toString();
      return;
    }

    current.setAttribute('aria-busy', 'true');

    try {
      const sectionId = current.dataset.collectionSection;
      const requestUrl = new URL(url, window.location.origin);
      requestUrl.searchParams.set('sections', sectionId);
      requestUrl.searchParams.set('sections_url', new URL(url, window.location.origin).pathname);

      const response = await fetch(requestUrl.toString(), {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Collection request failed: ${response.status}`);
      }

      const data = await response.json();
      const html = data[sectionId];

      if (!html) {
        throw new Error('Collection section was not returned.');
      }

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = doc.querySelector('[data-collection-section]');

      if (!fresh) {
        throw new Error('Collection section markup was not found.');
      }

      current.replaceWith(fresh);

      if (pushHistory) {
        history.pushState({}, '', url.toString());
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Collection refresh error:', error);
      window.location.href = url.toString();
    }
  }


  document.addEventListener('change', event => {
    const filterInput =
      event.target.closest('.filters form input, .filters form select');

    if (!filterInput) {
      return;
    }

    const form = filterInput.closest('form');

    if (!form) {
      return;
    }

    event.preventDefault();

    const url = new URL(form.action || window.location.href, window.location.origin);
    const params = new URLSearchParams(new FormData(form));

    [...url.searchParams.keys()].forEach(key => {
      if (key !== 'sort_by') {
        url.searchParams.delete(key);
      }
    });

    params.forEach((value, key) => {
      if (value !== '') {
        url.searchParams.append(key, value);
      }
    });

    refreshCollection(url);
  });


  document.addEventListener('change', event => {
    const select = event.target.closest('select[data-sort]');

    if (!select) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', select.value);
    refreshCollection(url);
  });


  window.addEventListener('popstate', () => {
    refreshCollection(window.location.href, false);
  });


  /* =========================================================
     PRODUCT GALLERY
     ========================================================= */

  $$('[data-gallery]').forEach(
    gallery => {
      const main =
        $('.gallery__main', gallery);

      const items =
        $$('.gallery__item', gallery);

      const thumbnails =
        $$('.gallery__thumbs button', gallery);


      if (!main) {
        return;
      }


      thumbnails.forEach(
        (button, index) => {
          button.addEventListener(
            'click',
            () => {
              if (!items[index]) {
                return;
              }

              main.scrollTo({
                left:
                  items[index]
                    .offsetLeft,
                behavior: 'smooth'
              });
            }
          );
        }
      );


      main.addEventListener(
        'scroll',
        () => {
          const index =
            Math.round(
              main.scrollLeft /
              main.clientWidth
            );

          thumbnails.forEach(
            (button, buttonIndex) => {
              button.setAttribute(
                'aria-current',
                buttonIndex === index
              );
            }
          );
        },
        {
          passive: true
        }
      );


      /* Image zoom */

      items.forEach(
        item => {
          const image =
            $('img', item);

          if (!image) {
            return;
          }

          item.addEventListener(
            'mousemove',
            event => {
              const rect =
                item.getBoundingClientRect();

              const x =
                (
                  (event.clientX -
                    rect.left) /
                  rect.width
                ) *
                100;

              const y =
                (
                  (event.clientY -
                    rect.top) /
                  rect.height
                ) *
                100;

              image.style.transformOrigin =
                `${x}% ${y}%`;
            }
          );
        }
      );
    }
  );


  /* =========================================================
     PRODUCT VARIANTS
     ========================================================= */

  $$('#product-form').forEach(
    form => {
      const section =
        form.closest('section') ||
        document;

      const variantsJson =
        $('[data-variants-json]', section);

      if (!variantsJson) {
        return;
      }


      let data;

      try {
        data =
          JSON.parse(
            variantsJson.textContent
          );
      } catch (error) {
        console.error(
          'Variant JSON error:',
          error
        );

        return;
      }


      const updateVariant =
        () => {
          const selected =
            $$('.variants input:checked', form)
              .map(input => input.value);


          const variant =
            data.find(
              item =>
                item.options.every(
                  (option, index) =>
                    option ===
                    selected[index]
                )
            );


          if (!variant) {
            return;
          }


          const idInput =
            $('[name="id"]', form);

          if (idInput) {
            idInput.value =
              variant.id;
          }


          const prices =
            $$('[data-price-now]');

          prices.forEach(
            price => {
              price.textContent =
                money(
                  variant.price
                );
            }
          );


          const button =
            $('[data-atc]', form);

          if (button) {
            button.disabled =
              !variant.available;

            button.textContent =
              variant.available
                ? 'Add to cart'
                : 'Sold out';
          }

          const buyNow =
            $('[name="checkout"].buy-now', form);

          if (buyNow) {
            buyNow.disabled = !variant.available;
            buyNow.hidden = !variant.available;
          }

          const comparePrice =
            $('[data-price-was]');
          const saveBadge =
            $('[data-price-save]');

          const hasCompare =
            Number(variant.compare_at_price || 0) >
            Number(variant.price || 0);

          if (comparePrice) {
            comparePrice.textContent = hasCompare
              ? money(variant.compare_at_price)
              : '';
            comparePrice.hidden = !hasCompare;
          }

          if (saveBadge) {
            const saving = hasCompare
              ? Math.round(
                  ((variant.compare_at_price - variant.price) * 100) /
                  variant.compare_at_price
                )
              : 0;
            saveBadge.textContent = hasCompare
              ? `Save ${saving}%`
              : '';
            saveBadge.hidden = !hasCompare;
          }

          const unitPrice =
            $('[data-unit-price]');

          if (unitPrice) {
            if (variant.unit_price && variant.unit_price_measurement) {
              const measurement =
                variant.unit_price_measurement;
              const referenceValue =
                measurement.reference_value || 1;
              const referenceUnit =
                measurement.reference_unit || '';
              unitPrice.textContent =
                `${money(variant.unit_price)} / ${referenceValue}${referenceUnit}`;
              unitPrice.hidden = false;
            } else {
              unitPrice.textContent = '';
              unitPrice.hidden = true;
            }
          }

          if (variant.featured_media_id) {
            const media =
              document.querySelector(
                `[data-media-id="${variant.featured_media_id}"]`
              );
            const gallery =
              $('[data-gallery] .gallery__main');

            if (media && gallery) {
              gallery.scrollTo({
                left: media.offsetLeft,
                behavior: 'smooth'
              });
            }
          }


          const url =
            new URL(
              location.href
            );

          url.searchParams.set(
            'variant',
            variant.id
          );

          history.replaceState(
            {},
            '',
            url
          );
        };


      form.addEventListener(
        'change',
        event => {
          if (
            event.target.closest(
              '.variants'
            )
          ) {
            updateVariant();
          }
        }
      );


      updateVariant();
    }
  );


  /* =========================================================
     QUANTITY BUTTONS
     ========================================================= */

  document.addEventListener(
    'click',
    event => {
      const button =
        event.target.closest(
          '[data-step]'
        );

      if (!button) {
        return;
      }

      const parent =
        button.parentElement;

      if (!parent) {
        return;
      }

      const input =
        $('input', parent);

      if (!input) {
        return;
      }

      const step =
        +button.dataset.step || 0;

      const current =
        +input.value || 1;

      input.value =
        Math.max(
          1,
          current + step
        );

      input.dispatchEvent(
        new Event(
          'change',
          {
            bubbles: true
          }
        )
      );
    }
  );


  /* =========================================================
     STICKY ADD TO CART
     ========================================================= */

  const atc =
    $('[data-atc]');

  const stickyAtc =
    $('[data-sticky-atc]');


  if (
    atc &&
    stickyAtc &&
    'IntersectionObserver' in window
  ) {
    new IntersectionObserver(
      ([entry]) => {
        stickyAtc.classList.toggle(
          'is-visible',
          !entry.isIntersecting &&
          entry.boundingClientRect.top < 0
        );
      }
    ).observe(atc);
  }


  $$(
    '[data-sticky-atc] button'
  ).forEach(
    button => {
      button.addEventListener(
        'click',
        () => {
          if (atc) {
            atc.click();
          }
        }
      );
    }
  );


  /* =========================================================
     PINCODE CHECKER
     ========================================================= */

  $$('[data-pincode]').forEach(
    box => {
      const serviceable =
        (
          box.dataset.serviceable ||
          ''
        )
          .split(',')
          .map(
            value =>
              value.trim()
          )
          .filter(Boolean);


      const min =
        +box.dataset.min;

      const max =
        +box.dataset.max;

      const message =
        $('.pin__msg', box);

      const form =
        $('form', box);


      if (!form) {
        return;
      }


      form.addEventListener(
        'submit',
        event => {
          event.preventDefault();

          const input =
            $('input', form);

          if (!input || !message) {
            return;
          }

          const pin =
            input.value.trim();


          if (
            !/^[1-9][0-9]{5}$/.test(
              pin
            )
          ) {
            message.textContent =
              'Enter a valid 6-digit pincode.';

            return;
          }


          if (
            serviceable.length &&
            !serviceable.some(
              prefix =>
                pin.startsWith(
                  prefix
                )
            )
          ) {
            message.textContent =
              'Sorry, we do not deliver to this pincode yet.';

            return;
          }


          const formatDate =
            days => {
              const date =
                new Date();

              date.setDate(
                date.getDate() +
                days
              );

              return date.toLocaleDateString(
                'en-IN',
                {
                  day: 'numeric',
                  month: 'short'
                }
              );
            };


          message.textContent =
            `Delivery available. Estimated ${formatDate(min)} – ${formatDate(max)}.`;
        }
      );
    }
  );


  /* =========================================================
     ARTICLE TOC
     ========================================================= */

  const article =
    $('[data-article]');

  const toc =
    $('[data-toc]');


  if (
    article &&
    toc
  ) {
    const headings =
      $$('h2', article);


    if (
      headings.length > 2
    ) {
      toc.hidden = false;

      const list =
        $('ol', toc);

      if (list) {
        list.innerHTML =
          headings
            .map(
              (heading, index) => {
                heading.id =
                  heading.id ||
                  `h${index}`;

                return `
                  <li>
                    <a href="#${heading.id}">
                      ${heading.textContent}
                    </a>
                  </li>
                `;
              }
            )
            .join('');
      }
    }
  }


  /* =========================================================
     FAQ SEARCH
     ========================================================= */

  const faqSearch =
    $('[data-faq-search]');


  if (faqSearch) {
    faqSearch.addEventListener(
      'input',
      () => {
        const query =
          faqSearch.value
            .toLowerCase()
            .trim();


        $$('[data-faq-item]')
          .forEach(
            item => {
              item.hidden =
                Boolean(
                  query &&
                  !item.textContent
                    .toLowerCase()
                    .includes(query)
                );
            }
          );
      }
    );
  }


  /* =========================================================
     HEADER HEIGHT
     ========================================================= */

  const header =
    $('.header');


  if (header) {
    const setHeaderHeight =
      () => {
        document.documentElement.style.setProperty(
          '--header-h',
          `${header.offsetHeight}px`
        );
      };


    setHeaderHeight();


    window.addEventListener(
      'resize',
      setHeaderHeight
    );


    if (
      'ResizeObserver' in window
    ) {
      new ResizeObserver(
        setHeaderHeight
      ).observe(header);
    }
  }


  /* =========================================================
     CLOSE MOBILE MENU WHEN LINK IS CLICKED
     ========================================================= */

  document.addEventListener(
    'click',
    event => {
      if (
        event.target.closest(
          '#menu-drawer a'
        )
      ) {
        closeDrawers();
      }
    }
  );


  /* =========================================================
     REVEAL ANIMATIONS
     ========================================================= */

  if (
    'IntersectionObserver' in window
  ) {
    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(
            entry => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  'is-in'
                );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.15
        }
      );


    $$('[data-reveal]').forEach(
      element => {
        observer.observe(element);
      }
    );
  } else {
    $$('[data-reveal]').forEach(
      element => {
        element.classList.add(
          'is-in'
        );
      }
    );
  }

})();