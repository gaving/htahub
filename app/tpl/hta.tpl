<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
    <head>
        <hta:application id='smartmain' sysMenu='yes' applicationName='{{name}}'
        scroll='no' windowstate='maximize' maximizeButton='yes'
        singleInstance='no' caption='yes' border='thick' borderStyle='raised'
        icon="#" navigable='yes'>
        <title>{{name}}</title>
    </head>
    <frameset>
        <frame scrolling='yes' application='yes' trusted='yes' src='{{url}}'></frame>
    </frameset>
</html>
