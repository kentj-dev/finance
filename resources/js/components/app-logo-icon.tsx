import React from 'react';

function AppLogoIconComponent() {
    return <img src="/ched-logo.png" alt="chedro-12" className="size-10" />;
}

const AppLogoIcon = React.memo(AppLogoIconComponent);
export default AppLogoIcon;
