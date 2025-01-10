import type { Schedule } from '@/types/group';

interface ValidationError {
    field: string;
    message: string;
}

interface GroupValidation {
    name: string;
    description: string;
    contributionAmount: string;
    currency: string;
    schedule: Schedule;
}

export function validateGroup(data: GroupValidation): ValidationError[] {
    const errors: ValidationError[] = [];

    // Name validation
    if (!data.name.trim()) {
        errors.push({ field: 'name', message: 'Name is required' });
    } else if (data.name.length < 3) {
        errors.push({ field: 'name', message: 'Name must be at least 3 characters' });
    } else if (data.name.length > 50) {
        errors.push({ field: 'name', message: 'Name must be less than 50 characters' });
    }

    // Description validation
    if (!data.description.trim()) {
        errors.push({ field: 'description', message: 'Description is required' });
    } else if (data.description.length < 10) {
        errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    } else if (data.description.length > 500) {
        errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
    }

    // Contribution amount validation
    const amount = parseFloat(data.contributionAmount);
    if (isNaN(amount)) {
        errors.push({ field: 'contributionAmount', message: 'Invalid contribution amount' });
    } else if (amount <= 0) {
        errors.push({ field: 'contributionAmount', message: 'Contribution amount must be greater than 0' });
    }

    // Schedule validation
    const now = new Date();
    const startDate = new Date(data.schedule.startDate);
    const endDate = new Date(data.schedule.endDate);

    if (startDate < now) {
        errors.push({ field: 'startDate', message: 'Start date must be in the future' });
    }

    if (endDate <= startDate) {
        errors.push({ field: 'endDate', message: 'End date must be after start date' });
    }

    const durationMonths = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (durationMonths < 3) {
        errors.push({ field: 'endDate', message: 'Group duration must be at least 3 months' });
    } else if (durationMonths > 24) {
        errors.push({ field: 'endDate', message: 'Group duration cannot exceed 24 months' });
    }

    return errors;
} 