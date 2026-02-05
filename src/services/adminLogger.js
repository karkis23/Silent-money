import { supabase } from './supabase';

export const logAdminAction = async (adminId, actionType, targetType, targetId, details = {}) => {
    try {
        await supabase.from('admin_logs').insert([{
            admin_id: adminId,
            action_type: actionType,
            target_type: targetType,
            target_id: targetId,
            details
        }]);
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
};
