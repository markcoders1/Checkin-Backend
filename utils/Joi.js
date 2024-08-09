import Joi from "joi";

export const registerUserJoi = Joi.object({
	fullName: Joi.string().required().max(30).messages({
		"any.required": "Full name is required.",
		"string.empty": "Full name cannot be empty.",
		"string.max": "User name should not exceed 30 characters.",
	}),

	companyId: Joi.string().required().messages({
		"any.required": "companyId is required.",
		"string.empty": "companyId cannot be empty.",
	}),

	DOB: Joi.string()
		.required()
		.max(30)
		.regex(/^((?:19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/)
		.messages({
			"any.required": "DOB is required.",
			"string.empty": "DOB cannot be empty.",
			"string.max": "DOB should not exceed 30 characters.",
			"string.pattern.base": "enter a valid DOB ex:(YYYY-MM-DD)",
		}),

	CNIC: Joi.string().required()
		.regex(/^[0-9]{13}$/)
		.length(13)
		.messages({
			"string.length": "enter a valid CNIC ex:(4230100000000)",
			"string.pattern.base": "enter a valid CNIC ex:(4230100000000)",
		}),

	phone: Joi.string()
		.required()
		.regex(/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/)
		.messages({
			"string.pattern.base": "enter a valid Pakistani Phone number",
		}),

	designation: Joi.string().required().max(30).messages({
		"any.required": "designation is required.",
		"string.empty": "designation cannot be empty.",
		"string.max": "designation should not exceed 30 characters.",
	}),

	teamLead: Joi.string().required().max(30).messages({
		"any.required": "teamLead is required.",
		"string.empty": "teamLead cannot be empty.",
		"string.max": "teamLead should not exceed 30 characters.",
	}),

	shift: Joi.string().required().max(30).messages({
		"any.required": "shift is required.",
		"string.empty": "shift cannot be empty.",
		"string.max": "shift should not exceed 30 characters.",
	}),

	department: Joi.string().required().max(30).messages({
		"any.required": "department is required.",
		"string.empty": "department cannot be empty.",
		"string.max": "department should not exceed 30 characters.",
	}),

	role: Joi.string().valid("admin", "user").required().messages({
		"any.only": "role must be either admin or user",
		"any.required": "role is required",
		"string.base": "role must be a string",
	}),

	password: Joi.string()
		.min(6)
		.max(30)
		.pattern(
			new RegExp(
				"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$"
			)
		)
		.messages({
			"string.min": "Password should be minimum 6 characters.",
			"string.max": "Password should be maximum 30 characters.",
			"string.pattern.base":
				"Password must include at least one uppercase letter, one lowercase letter and one number",
			"any.required": "Password is required.",
		}),

	email: Joi.string().email().required().messages({
		"any.required": "Email is required.",
		"string.empty": "Email cannot be empty.",
		"string.email": "Invalid email format.",
	}),
	address: Joi.string().min(0).messages({
		"string.empty": "address cannot be empty.",
	}),

});

export const updateAnyProfileJoi = Joi.object({
	id: Joi.string().required().max(30).min(10).messages({
		"any.required": "id is required.",
		"string.empty": "id cannot be empty.",
		"string.max": "id should not exceed 30 characters.",
		"string.min": "id should be more than 10 characters.",
	}),
	fullName: Joi.string().max(30).messages({
		"string.empty": "Full name cannot be empty.",
		"string.max": "User name should not exceed 30 characters.",
	}),

	companyId: Joi.string().messages({
		"string.empty": "companyId cannot be empty.",
	}),

	address: Joi.string().required().messages({
		"any.required": "address is required.",
		"string.empty": "address cannot be empty.",
	}),

	DOB: Joi.string()
		.max(30)
		.regex(/^((?:19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/)
		.messages({
			"string.empty": "DOB cannot be empty.",
			"string.max": "DOB should not exceed 30 characters.",
			"string.pattern.base": "enter a valid DOB ex:(YYYY-MM-DD)",
		}),

	CNIC: Joi.string()
		.regex(/^[0-9]{13}$/)
		.length(13)
		.messages({
			"string.length": "enter a valid CNIC ex:(4230100000000)",
			"string.pattern.base": "enter a valid CNIC ex:(4230100000000)",
		}),

	phone: Joi.string()
		.regex(/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/)
		.messages({
			"string.pattern.base": "enter a valid Pakistani Phone number",
		}),

	designation: Joi.string().max(30).messages({
		"string.empty": "designation cannot be empty.",
		"string.max": "designation should not exceed 30 characters.",
	}),

	teamLead: Joi.string().max(30).messages({
		"string.empty": "teamLead cannot be empty.",
		"string.max": "teamLead should not exceed 30 characters.",
	}),

	shift: Joi.string().max(30).messages({
		"string.empty": "shift cannot be empty.",
		"string.max": "shift should not exceed 30 characters.",
	}),

	department: Joi.string().max(30).messages({
		"string.empty": "department cannot be empty.",
		"string.max": "department should not exceed 30 characters.",
	}),

	email: Joi.string().email().messages({
		"string.empty": "Email cannot be empty.",
		"string.email": "Invalid email format.",
	}),
}).or(
	"fullName",
	"companyId",
	"CNIC",
	"DOB",
	"phone",
	"email",
	"designation",
	"teamLead",
	"shift",
	"department",
	"address"
);

export const loginUserJoi = Joi.object({
	email: Joi.string().email().required().messages({
		"any.required": "Email is required.",
		"string.empty": "Email cannot be empty.",
		"string.email": "Invalid email format.",
	}),

	password: Joi.string()
		.required()
		.min(6)
		.max(30)
		.messages({
			"string.min": "Password should be minimum 6 characters.",
			"any.required": "Password is required.",
			"string.max":"Password shoould be maximum 30 characters."
		}),

	device: Joi.string().required(),
});

export const resetPasswordJoi = Joi.object({
	email: Joi.string().email().required().messages({
		"any.required": "Email is required.",
		"string.empty": "Email cannot be empty.",
		"string.email": "Invalid email format.",
	}),
});

export const resetPassword2Joi = Joi.object({
	password: Joi.string()
		.min(6)
		.max(30)
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_,+=/-\/?.]).+$"
			)
		)
		.required()
		.messages({
			"string.min": "Password should be minimum 6 characters.",
			"string.max": "Password should be maximum 30 characters.",
			"string.pattern.base":"Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
			"any.required": "Password is required.",
		}),
	token: Joi.string().required().messages({
			"any.required": "token is required.",
			"string.empty": "token cannot be empty.",
		}),
});

export const updateDetailsJoi = Joi.object({
	fullName: Joi.string().max(30).messages({
		"string.empty": "Full name cannot be empty.",
		"string.max": "User name should not exceed 30 characters.",
	}),

	DOB: Joi.string()
		.max(30)
		.regex(/^((?:19|20)\d\d)-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/)
		.messages({
			"string.max": "DOB should not exceed 30 characters.",
			"string.pattern.base": "enter a valid DOB ex:(YYYY-MM-DD)",
		}),

	CNIC: Joi.string()
		.regex(/^[0-9]{13}$/)
		.length(13)
		.messages({
			"string.length": "enter a valid CNIC ex:(4230100000000)",
			"string.pattern.base": "enter a valid CNIC ex:(4230100000000)",
		}),

	phone: Joi.string()
		.regex(/^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/)
		.messages({
			"string.pattern.base": "enter a valid Pakistani Phone number",
		}),
}).or("fullName",  "CNIC", "DOB", "phone");

export const changePasswordJoi = Joi.object({
	oldPassword: Joi.string()
		.required()
		.messages({
			"string.pattern.base":
				"oldPassword must be between 6 and 30 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
			"any.required": "Password is required.",
		}),
	newPassword: Joi.string()
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
			)
		)
		.min(6)
		.max(30)
		.required()
		.messages({
			"string.pattern.base":
				"newPassword must be between 6 and 30 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
			"any.required": "Password is required.",
		}),
});