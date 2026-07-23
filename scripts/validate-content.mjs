/* global console, process */
import { formatContentValidation, validateContentContracts } from './content-contract.mjs'

const result = await validateContentContracts()
console.log(formatContentValidation(result))
if (!result.valid) process.exitCode = 1
