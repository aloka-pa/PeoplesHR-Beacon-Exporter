(function () {
    const enabledAgents = JSON.parse(
        localStorage.getItem('enabledAgents') || '[]'
    );

    const normalizedAgents = enabledAgents.map(agent =>
        String(agent).toLowerCase().replace(/\s+/g, '')
    );

    // Enable General Help only when prodhelp and/or org support is requested.
    return normalizedAgents.includes('prodhelp') || normalizedAgents.includes('orgsup');
})()