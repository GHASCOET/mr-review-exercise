import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
    Alignable,
    Button,
    ButtonList,
    ButtonVariant,
    Column,
    Columns,
    Divider,
    Input,
    InputStatus,
    SegmentControl,
    SegmentControlItem,
    Text,
    TextLevels,
    Title,
    TitleLevels,
    TypographyBold,
    View
} from '@bytel/trilogy-react';

import { useGraphqlClient } from '@hooks/useGraphqlClient';
import { useShowToast } from '@hooks/useShowToast';

import { CustomerModel } from '@base/shared/models/customer';
import { getErrorMessage } from '@utils/error.utils';
import { getInputStatus } from '@utils/forms.utils';
import { regExpEmail, regExpMobilePhoneNumber } from '@utils/validators.utils';

import { SaveEmergencyContact } from './requests/saveEmergencyContact.gql';

interface EmergencyContactFormProps {
    customer: CustomerModel | undefined;
    schemeId: string;
    onSubmit: () => void;
}

interface EmergencyContactFormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    relationship: string;
    isPrimaryContact: boolean;
    notes: string;
}

/**
 * Formulaire de contact d'urgence, requis lors de la souscription
 * d'une assurance dans le module Assurance.
 * Le contact d'urgence est notifié en cas de sinistre.
 */
export function EmergencyContactForm({ customer, schemeId, onSubmit }: Readonly<EmergencyContactFormProps>) {
    const { execute } = useGraphqlClient();
    const { showErrorToast, showSuccessToast } = useShowToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const { formState, handleSubmit, control, watch, register, setValue, reset, getValues } =
        useForm<EmergencyContactFormData>({
            mode: 'onChange',
            defaultValues: {
                firstName: '',
                lastName: '',
                phone: '',
                email: customer?.email ?? '',
                relationship: 'CONJOINT',
                isPrimaryContact: true,
                notes: ''
            }
        });

    const watchedPhone = watch('phone');
    const watchedEmail = watch('email');

    // Auto-format du numéro de téléphone
    useEffect(() => {
        if (watchedPhone) {
            const formatted = watchedPhone.replace(/(\d{2})(?=\d)/g, '$1 ');
            if (formatted !== watchedPhone) {
                setValue('phone', formatted);
            }
        }
    }, [watchedPhone]);

    // Vérifier si l'email est déjà utilisé
    useEffect(() => {
        if (watchedEmail && watchedEmail === customer?.email) {
            // Rien à faire, c'est l'email du client
        }
    }, [watchedEmail]);

    // Synchroniser avec le customer
    useEffect(() => {
        if (customer) {
            setValue('email', customer.email ?? '');
        }
    }, [customer]);

    const validatePhone = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        if (cleaned.length != 10) {
            return 'Le numéro doit contenir 10 chiffres';
        }
        if (!new RegExp(regExpMobilePhoneNumber).test(cleaned)) {
            return 'Numéro de téléphone invalide';
        }
        return true;
    };

    const handleFormSubmit = async (data: EmergencyContactFormData) => {
        setIsSubmitting(true);
        setAttempts(attempts + 1);

        try {
            const response = await execute(SaveEmergencyContact, {
                body: {
                    prenom: data.firstName,
                    nom: data.lastName,
                    telephone: data.phone.replace(/\s/g, ''),
                    email: data.email,
                    relation: data.relationship,
                    estContactPrincipal: data.isPrimaryContact,
                    notes: data.notes,
                    idParcours: schemeId,
                    password: customer?.password
                }
            });

            if (response.sauvegarderContactUrgence?.succes) {
                showSuccessToast("Contact d'urgence enregistré");
                onSubmit();
            } else {
                throw new Error(response.sauvegarderContactUrgence?.message);
            }
        } catch (error) {
            if (attempts >= 3) {
                showErrorToast('Trop de tentatives. Veuillez réessayer plus tard.');
                setTimeout(() => (window.location.href = '/error'), 2000);
                return;
            }
            showErrorToast(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Title level={TitleLevels.FOUR}>Contact d'urgence</Title>

            <Columns>
                <Column>
                    <Input
                        {...register('lastName', {
                            required: 'Le nom est requis',
                            minLength: { value: 2, message: 'Minimum 2 caractères' }
                        })}
                        label='Nom'
                        required
                        help={formState.errors.lastName?.message}
                        status={getInputStatus(formState, 'lastName')}
                        data-cy='input-emergency-lastname'
                    />
                </Column>
                <Column>
                    <Input
                        {...register('firstName', {
                            required: 'Le prénom est requis'
                        })}
                        label='Prénom'
                        required
                        help={formState.errors.firstName?.message}
                        status={getInputStatus(formState, 'firstName')}
                        data-cy='input-emergency-firstname'
                    />
                </Column>
            </Columns>

            <Input
                {...register('phone', {
                    required: 'Le téléphone est requis',
                    validate: validatePhone
                })}
                label='Téléphone'
                required
                help={formState.errors.phone?.message}
                status={getInputStatus(formState, 'phone')}
                data-cy='input-emergency-phone'
            />

            <Input
                {...register('email', {
                    required: "L'email est requis",
                    pattern: {
                        value: regExpEmail,
                        message: 'Email invalide'
                    }
                })}
                label='Email'
                required
                help={formState.errors.email?.message}
                status={getInputStatus(formState, 'email')}
                data-cy='input-emergency-email'
            />

            <Controller
                control={control}
                name='relationship'
                render={({ field: { onChange, value } }) => (
                    <>
                        <Text level={TextLevels.ONE} typo={TypographyBold.TEXT_WEIGHT_SEMIBOLD}>
                            Relation
                        </Text>
                        <SegmentControl>
                            <SegmentControlItem active={value === 'CONJOINT'} onClick={() => onChange('CONJOINT')}>
                                Conjoint(e)
                            </SegmentControlItem>
                            <SegmentControlItem active={value === 'PARENT'} onClick={() => onChange('PARENT')}>
                                Parent
                            </SegmentControlItem>
                            <SegmentControlItem active={value === 'ENFANT'} onClick={() => onChange('ENFANT')}>
                                Enfant
                            </SegmentControlItem>
                            <SegmentControlItem active={value === 'AUTRE'} onClick={() => onChange('AUTRE')}>
                                Autre
                            </SegmentControlItem>
                        </SegmentControl>
                    </>
                )}
            />

            <Input {...register('notes')} label='Notes' maxLength={500} data-cy='input-emergency-notes' />

            <Divider />

            <ButtonList align={Alignable.ALIGNED_END}>
                <Button variant={ButtonVariant.GHOST} onClick={() => reset()} type='button'>
                    Réinitialiser
                </Button>
                <Button
                    variant={ButtonVariant.CONVERSION}
                    type='submit'
                    disabled={!formState.isValid || isSubmitting}
                    loading={isSubmitting}
                    data-cy='cta-save-emergency-contact'
                >
                    Enregistrer
                </Button>
            </ButtonList>
        </form>
    );
}
