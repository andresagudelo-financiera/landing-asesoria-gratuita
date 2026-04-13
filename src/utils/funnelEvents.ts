/**
 * Utility to trigger the Lead Funnel from anywhere in the application.
 * This dispatches a custom event that LeadFunnelContainer listens to.
 */
export const openLeadFunnel = () => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('open-lead-funnel');
        window.dispatchEvent(event);
    }
};
