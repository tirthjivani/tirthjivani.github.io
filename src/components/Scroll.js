import { useEffect } from 'react';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';

var overScrollPlugin = {
  enable: true,
  effect: 'bounce',
  damping: 0.09,
  maxOverscroll: 150,
};

var options = {
  damping: 0.04,
  plugins: {
    overscroll: { ...overScrollPlugin },
  },
};

const Scroll = () => {
  useEffect(() => {
    Scrollbar.use(OverscrollPlugin);
    Scrollbar.init(document.body, options);
    return () => {
      if (Scrollbar) Scrollbar.destroy(document.body);
    };
  }, []);

  return null;
};

export default Scroll;
