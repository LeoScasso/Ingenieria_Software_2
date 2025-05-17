const BackgroundLogo = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'url("/logoAlquilapp.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '40%',
      opacity: 0.02,
      pointerEvents: 'none',
    }}
  />
);

export default BackgroundLogo;