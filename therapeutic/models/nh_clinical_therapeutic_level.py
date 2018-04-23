from openerp import models, fields, api

from openerp.exceptions import ValidationError


class NhClinicalPatientObservationTherapeuticLevel(models.Model):

    _name = 'nh.clinical.therapeutic.level'

    levels = [
        (1, 'Level 1'),
        (2, 'Level 2'),
        (3, 'Level 3'),
        (4, 'Level 4')
    ]
    frequencies = [
        (5, 'Every 5 Minutes'),
        (10, 'Every 10 Minutes'),
        (15, 'Every 15 Minutes'),
        (20, 'Every 20 Minutes'),
        (25, 'Every 25 Minutes'),
        (30, 'Every 30 Minutes'),
        (60, 'Every Hour')
    ]
    staff_to_patient_ratios = [
        (1, '1:1'),
        (2, '2:1'),
        (3, '3:1')
    ]

    patient = fields.Many2one(
        comodel_name='nh.clinical.patient', required=True
    )
    level = fields.Selection(
        required=True, selection=levels, string='Observation Level'
    )
    frequency = fields.Selection(
        selection=frequencies,
        string='Observation Frequency'
    )
    staff_to_patient_ratio = fields.Selection(
        selection=staff_to_patient_ratios,
        string='Staff to patient ratio'
    )

    @api.onchange('level')
    def _set_fields_based_on_level(self):
        if self.is_level(1):
            self.frequency = 60
            self.staff_to_patient_ratio = False
        elif self.is_level(2):
            self.frequency = False
            self.staff_to_patient_ratio = False
        elif self.is_level(3) or self.is_level(4):
            self.frequency = False

    def default_get(self, cr, uid, fields, context=None):
        """
        Ensure that the patient field is pre-populated on the form view when
        creating a new level record from the wardboard view.

        :param cr:
        :param uid:
        :param fields:
        :param context:
        :return:
        """
        field_defaults_dict = \
            super(NhClinicalPatientObservationTherapeuticLevel, self)\
            .default_get(cr, uid, fields, context=None)

        if 'active_id' in context \
                and 'active_model' in context \
                and context['active_model'] == 'nh.clinical.wardboard':
            wardboard_model = self.pool['nh.clinical.wardboard']
            wardboard = wardboard_model.browse(cr, uid, context['active_id'])
            patient_id = wardboard.patient_id.id

            field_defaults_dict['patient'] = patient_id
        return field_defaults_dict

    def save(self, cr, uid, ids, context=None):
        """
        There is a 'Save' button in the 'Set Therapeutic Obs' dialog accessible
        from the patient form. This method exists purely to stop that button
        from blowing up.

        Pressing the button creates the therapeutic level
        record even without calling anything (I think the `oe_form_button_save`
        class on the button triggers an action in Odoo's JavaScript) but if
        there is nothing set on the button to call then it blows up during
        module load.

        :param cr:
        :param uid:
        :param ids:
        :param context:
        :return:
        """
        pass

    @api.constrains('level', 'frequency')
    def _validate(self):
        if self.is_level(1):
            # Always every hour so no need to store.
            self._validate_frequency_is_false()
            self._validate_staff_to_patient_ratio_is_false()
        elif self.is_level(2):
            self._validate_staff_to_patient_ratio_is_false()
            self._validate_frequency_is_given()
        elif self.is_level(3) or self.is_level(4):
            self._validate_frequency_is_false()
            self._validate_staff_to_patient_ratio_is_given()

    def _validate_frequency_is_false(self):
        if self.frequency is not False:
            raise ValidationError(
                "Frequency should not be provided for this level."
            )

    def _validate_staff_to_patient_ratio_is_false(self):
        if self.staff_to_patient_ratio is not False:
            raise ValidationError(
                "Staff to patient ratio should not be provided for this level."
            )

    def _validate_frequency_is_given(self):
        if not self.frequency:
            raise ValidationError(
                "Please fill out all fields before saving."
            )

    def _validate_staff_to_patient_ratio_is_given(self):
        if not self.staff_to_patient_ratio:
            raise ValidationError(
                "Please fill out all fields before saving."
            )

    @api.model
    def get_current_level_record_for_patient(self, patient_id):
        current_level_record = self.search([
            ('patient', '=', patient_id)
        ], order='id desc', limit=1)
        return current_level_record

    def is_level(self, level):
        return self.level == self.levels[level - 1][0]
